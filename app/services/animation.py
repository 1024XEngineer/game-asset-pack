import base64
import json
from typing import Any, Dict, List

from app.domain.models import (
    FRAME_COUNT,
    SHEET_HEIGHT,
    SHEET_WIDTH,
    GenerateAnimationCommand,
    JobStatus,
    ReferenceTransport,
    SpriteSheetGenerationRequest,
    build_manifest,
)
from app.postprocess.alignment import align_frames
from app.postprocess.gif_builder import build_gif
from app.postprocess.quality import inspect_frames
from app.postprocess.splitter import decode_and_split, encode_png
from app.providers.base import SpriteSheetProvider
from app.services.job_store import InMemoryJobStore
from app.services.prompt import build_sprite_sheet_prompt
from app.services.storage import LocalAssetStorage


class AnimationGenerationService:
    def __init__(
        self,
        provider: SpriteSheetProvider,
        storage: LocalAssetStorage,
        jobs: InMemoryJobStore,
    ) -> None:
        self._provider = provider
        self._storage = storage
        self._jobs = jobs

    async def run_job(self, job_id: str, command: GenerateAnimationCommand) -> None:
        try:
            await self._jobs.update(
                job_id,
                status=JobStatus.RUNNING.value,
                stage="preparing",
                progress=5,
            )
            self._storage.prepare_job(job_id)
            self._save_request_metadata(job_id, command)

            # The crop contract exists before image generation and never depends on image analysis.
            manifest = build_manifest(command)
            prompt = build_sprite_sheet_prompt(command)
            self._storage.save(
                job_id,
                "manifest.json",
                self._json_bytes(manifest.to_dict()),
            )
            self._storage.save(job_id, "compiled_prompt.txt", prompt.encode("utf-8"))
            reference_value = self._prepare_reference(job_id, command)

            await self._jobs.update(job_id, stage="generating", progress=20)
            # Exactly one provider generation call. There is deliberately no per-frame loop or retry.
            generated = await self._provider.generate(
                SpriteSheetGenerationRequest(prompt=prompt, images=[reference_value])
            )
            if generated.provider_call_count != 1:
                raise RuntimeError(
                    f"provider contract violation: expected one generation call, got {generated.provider_call_count}"
                )
            if (generated.width, generated.height) != (SHEET_WIDTH, SHEET_HEIGHT):
                raise RuntimeError(
                    f"model output must be exactly {SHEET_WIDTH}x{SHEET_HEIGHT}; got "
                    f"{generated.width}x{generated.height}"
                )

            manifest.generation = {
                "provider_call_count": generated.provider_call_count,
                "response_image_source": generated.source,
                "actual_width": generated.width,
                "actual_height": generated.height,
                "usage": generated.usage,
            }
            self._storage.save(job_id, "manifest.json", self._json_bytes(manifest.to_dict()))
            self._storage.save(job_id, "sprite_sheet_raw.png", generated.content)

            await self._jobs.update(job_id, stage="splitting", progress=55)
            sheet, raw_frames = decode_and_split(generated.content)
            self._storage.save(job_id, "sprite_sheet.png", encode_png(sheet))
            for index, frame in enumerate(raw_frames):
                self._storage.save(job_id, f"frames_raw/frame_{index:03d}.png", encode_png(frame))

            await self._jobs.update(job_id, stage="postprocessing", progress=70)
            final_frames, alignment_warnings = align_frames(raw_frames, command.alignment_mode)
            for index, frame in enumerate(final_frames):
                self._storage.save(job_id, f"frames/frame_{index:03d}.png", encode_png(frame))

            report = inspect_frames(final_frames)
            report.warnings.extend(alignment_warnings)
            self._storage.save(job_id, "quality_report.json", self._json_bytes(report.to_dict()))

            await self._jobs.update(job_id, stage="packaging", progress=85)
            gif = build_gif(final_frames, command.fps, command.loop)
            self._storage.save(job_id, "animation.gif", gif)

            result = self._build_result(job_id, command, report.to_dict())
            if not report.structural_passed:
                raise RuntimeError("structural quality check failed: " + "; ".join(report.errors))
            await self._jobs.update(
                job_id,
                status=JobStatus.COMPLETED.value,
                stage="completed",
                progress=100,
                result=result,
                error=None,
            )
        except Exception as exc:
            await self._jobs.update(
                job_id,
                status=JobStatus.FAILED.value,
                stage="failed",
                progress=100,
                error=str(exc),
            )

    def _prepare_reference(self, job_id: str, command: GenerateAnimationCommand) -> str:
        reference = command.reference
        if reference.transport == ReferenceTransport.URL:
            if not reference.url:
                raise ValueError("reference URL is missing")
            return reference.url
        if not reference.content or not reference.mime_type:
            raise ValueError("uploaded reference image is missing")
        extension = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp"}[
            reference.mime_type
        ]
        self._storage.save(job_id, f"reference/reference.{extension}", reference.content)
        encoded = base64.b64encode(reference.content).decode("ascii")
        return f"data:{reference.mime_type};base64,{encoded}"

    def _save_request_metadata(self, job_id: str, command: GenerateAnimationCommand) -> None:
        metadata = {
            "action_prompt": command.action_prompt,
            "action_name": command.action_name,
            "fps": command.fps,
            "loop": command.loop,
            "alignment_mode": command.alignment_mode.value,
            "reference": {
                "transport": command.reference.transport.value,
                "reference_type": command.reference.reference_type.value,
                "asset_kind": command.reference.asset_kind.value,
                "filename": command.reference.filename,
                "mime_type": command.reference.mime_type,
                "url": command.reference.url,
            },
        }
        self._storage.save(job_id, "request.json", self._json_bytes(metadata))

    def _build_result(
        self,
        job_id: str,
        command: GenerateAnimationCommand,
        quality: Dict[str, Any],
    ) -> Dict[str, Any]:
        frames: List[Dict[str, Any]] = []
        for index in range(FRAME_COUNT):
            frames.append(
                {
                    "index": index,
                    "phase": f"phase_{index + 1:02d}",
                    "url": self._storage.url(job_id, f"frames/frame_{index:03d}.png"),
                }
            )
        return {
            "action": {
                "name": command.action_name,
                "prompt": command.action_prompt,
                "frame_count": FRAME_COUNT,
                "fps": command.fps,
                "loop": command.loop,
            },
            "assets": {
                "sprite_sheet_url": self._storage.url(job_id, "sprite_sheet.png"),
                "sprite_sheet_raw_url": self._storage.url(job_id, "sprite_sheet_raw.png"),
                "gif_url": self._storage.url(job_id, "animation.gif"),
                "manifest_url": self._storage.url(job_id, "manifest.json"),
                "quality_report_url": self._storage.url(job_id, "quality_report.json"),
                "frames": frames,
            },
            "quality": quality,
        }

    @staticmethod
    def _json_bytes(value: Dict[str, Any]) -> bytes:
        return json.dumps(value, ensure_ascii=False, indent=2).encode("utf-8")

