from __future__ import annotations

import hashlib
import io
import json
import logging
import os
import re
import zipfile
from dataclasses import dataclass
from pathlib import Path
from statistics import median
from typing import Any
from uuid import uuid4

import httpx
from PIL import Image, ImageChops, ImageFilter, UnidentifiedImageError

from .models import (
    GenerationJobCreate,
    LayerAttributes,
    LayerMetadata,
    LayerRole,
    Repeat2,
    Scale2,
    Size2,
    Vector2,
)
from .repository import SceneryRepository


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Settings:
    data_dir: Path
    generation_api_url: str
    frontend_origin: str
    request_timeout_seconds: float = 320.0

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            data_dir=Path(os.getenv("SCENERY_DATA_DIR", "data")),
            generation_api_url=os.getenv(
                "IMAGE_GENERATION_API_URL", "http://127.0.0.1:8000"
            ).rstrip("/"),
            frontend_origin=os.getenv(
                "FRONTEND_ORIGIN", "http://127.0.0.1:3000"
            ).rstrip("/"),
        )

    @property
    def database_path(self) -> Path:
        return self.data_dir / "scenery.db"

    @property
    def generated_dir(self) -> Path:
        return self.data_dir / "generated"

    @property
    def exports_dir(self) -> Path:
        return self.data_dir / "exports"


class GenerationClient:
    def __init__(
        self,
        settings: Settings,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self.settings = settings
        self.transport = transport

    async def generate(self, prompt: str) -> tuple[bytes, str]:
        try:
            async with httpx.AsyncClient(
                timeout=self.settings.request_timeout_seconds,
                transport=self.transport,
            ) as client:
                response = await client.post(
                    f"{self.settings.generation_api_url}/generate",
                    json={"prompt": prompt},
                )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"generation service returned {exc.response.status_code}"
            ) from exc
        except httpx.RequestError as exc:
            raise RuntimeError("generation service is unavailable") from exc
        content_type = response.headers.get("content-type", "application/octet-stream")
        return response.content, content_type.split(";", 1)[0]


class ImageService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.settings.generated_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _checkerboard_subject_mask(rgb: Image.Image) -> Image.Image | None:
        """Recover a subject mask from a baked two-color checkerboard.

        The grid is reconstructed from a clean strip at the top and majority
        votes across each row. This lets a white cloud remain foreground when it
        crosses a gray square, then a small morphological close fills the same
        cloud where it crosses a white square. A plain lightness key cannot make
        that distinction and erodes white subjects.
        """

        width, height = rgb.size
        if width < 16 or height < 16:
            return None
        probe_height = max(8, min(height, height // 5))
        gray = rgb.convert("L")
        try:
            probe = gray.crop((0, 0, width, probe_height))
            try:
                histogram = probe.histogram()
            finally:
                probe.close()

            populated = [value for value, count in enumerate(histogram) if count]
            if len(populated) < 2:
                return None
            low = float(populated[0])
            high = float(populated[-1])
            low_count = high_count = 0
            for _ in range(12):
                split = int((low + high) / 2)
                low_count = sum(histogram[: split + 1])
                high_count = sum(histogram[split + 1 :])
                if not low_count or not high_count:
                    return None
                low = (
                    sum(value * histogram[value] for value in range(split + 1))
                    / low_count
                )
                high = (
                    sum(
                        value * histogram[value]
                        for value in range(split + 1, 256)
                    )
                    / high_count
                )
            probe_pixels = width * probe_height
            if (
                high - low < 6
                or low_count / probe_pixels < 0.15
                or high_count / probe_pixels < 0.15
            ):
                return None
            threshold = (low + high) / 2
            pixels = gray.load()

            reference_rows = range(1, min(4, probe_height))
            raw_x_classes: list[bool] = []
            for x in range(width):
                samples = sorted(pixels[x, y] for y in reference_rows)
                raw_x_classes.append(samples[len(samples) // 2] >= threshold)
            x_classes: list[bool] = []
            for x in range(width):
                nearby = raw_x_classes[max(0, x - 2) : min(width, x + 3)]
                x_classes.append(sum(nearby) * 2 >= len(nearby))

            run_lengths: list[int] = []
            run_start = 0
            current_class = x_classes[0]
            for x in range(1, width):
                if x_classes[x] != current_class:
                    run_lengths.append(x - run_start)
                    run_start = x
                    current_class = x_classes[x]
            run_lengths.append(width - run_start)
            interior_runs = run_lengths[1:-1] or run_lengths
            if len(interior_runs) < 4:
                return None
            tile_size = float(median(interior_runs))
            if not 4 <= tile_size <= 128:
                return None
            run_tolerance = max(2.0, tile_size * 0.35)
            regular_runs = sum(
                abs(run - tile_size) <= run_tolerance for run in interior_runs
            )
            if regular_runs / len(interior_runs) < 0.7:
                return None

            sample_step = max(4, round(tile_size))
            sample_start = max(1, sample_step // 2)
            sample_xs = list(range(sample_start, width, sample_step))
            y_flips: list[bool] = []
            for y in range(height):
                votes = [
                    (pixels[x, y] >= threshold) ^ x_classes[x]
                    for x in sample_xs
                ]
                y_flips.append(sum(votes) * 2 >= len(votes))

            rgb_pixels = rgb.load()
            color_sums = [[0, 0, 0, 0], [0, 0, 0, 0]]
            for y in range(probe_height):
                for x in range(width):
                    bucket = int(x_classes[x] ^ y_flips[y])
                    red, green, blue = rgb_pixels[x, y]
                    color_sums[bucket][0] += red
                    color_sums[bucket][1] += green
                    color_sums[bucket][2] += blue
                    color_sums[bucket][3] += 1
            colors = [
                tuple(
                    round(bucket[channel] / bucket[3]) for channel in range(3)
                )
                for bucket in color_sums
            ]

            x_mask = Image.new("L", (width, 1))
            y_mask = Image.new("L", (1, height))
            try:
                x_mask.putdata([255 if value else 0 for value in x_classes])
                y_mask.putdata([255 if value else 0 for value in y_flips])
                expanded_x = x_mask.resize(
                    (width, height), resample=Image.Resampling.NEAREST
                )
                expanded_y = y_mask.resize(
                    (width, height), resample=Image.Resampling.NEAREST
                )
            finally:
                x_mask.close()
                y_mask.close()
            try:
                parity = ImageChops.difference(expanded_x, expanded_y)
            finally:
                expanded_x.close()
                expanded_y.close()
            try:
                expected = Image.new("RGB", (width, height), colors[0])
                expected.paste(colors[1], (0, 0, width, height), parity)
            finally:
                parity.close()
            try:
                difference = ImageChops.difference(rgb, expected)
            finally:
                expected.close()
            try:
                red_diff, green_diff, blue_diff = difference.split()
                max_diff = ImageChops.lighter(
                    red_diff, ImageChops.lighter(green_diff, blue_diff)
                )
            finally:
                difference.close()
            try:
                probe_diff = max_diff.crop((0, 0, width, probe_height))
                try:
                    diff_histogram = probe_diff.histogram()
                finally:
                    probe_diff.close()
                cumulative = 0
                tolerance = 0
                for value, count in enumerate(diff_histogram):
                    cumulative += count
                    if cumulative / probe_pixels >= 0.99:
                        tolerance = value
                        break
                tolerance = max(3, min(12, tolerance))
                seed = max_diff.point(
                    [0 if value <= tolerance else 255 for value in range(256)]
                )
            finally:
                max_diff.close()
            try:
                cleaned_seed = seed.filter(ImageFilter.MedianFilter(3))
            finally:
                seed.close()
            close_radius = max(2, min(16, round(tile_size * 0.55)))
            close_size = close_radius * 2 + 1
            padded_seed = Image.new(
                "L",
                (width + close_radius * 2, height + close_radius * 2),
                0,
            )
            try:
                padded_seed.paste(cleaned_seed, (close_radius, close_radius))
                expanded = padded_seed.filter(ImageFilter.MaxFilter(close_size))
            finally:
                padded_seed.close()
                cleaned_seed.close()
            try:
                padded_closed = expanded.filter(ImageFilter.MinFilter(close_size))
            finally:
                expanded.close()
            try:
                closed = padded_closed.crop(
                    (
                        close_radius,
                        close_radius,
                        close_radius + width,
                        close_radius + height,
                    )
                )
            finally:
                padded_closed.close()
            try:
                eroded = closed.filter(ImageFilter.MinFilter(3))
            finally:
                closed.close()
            try:
                return eroded.filter(ImageFilter.MaxFilter(3))
            finally:
                eroded.close()
        finally:
            gray.close()

    @staticmethod
    def _solid_neutral_subject_mask(rgb: Image.Image) -> Image.Image | None:
        """Estimate a subject on a nearly uniform white/black generated backdrop.

        When a white cloud is rendered on white, exact boundaries are absent from
        the pixels. Colored cloud shadows are used as reliable seeds and expanded
        only a few pixels to restore the nearby white body without retaining the
        full opaque canvas.
        """

        width, height = rgb.size
        probe_height = max(8, min(height, height // 5))
        probe = rgb.crop((0, 0, width, probe_height))
        try:
            channels = probe.split()
            try:
                background_color = tuple(
                    max(range(256), key=channel.histogram().__getitem__)
                    for channel in channels
                )
            finally:
                for channel in channels:
                    channel.close()
            if (
                max(background_color) - min(background_color) > 18
                or not (min(background_color) >= 220 or max(background_color) <= 35)
            ):
                return None
            expected_probe = Image.new("RGB", probe.size, background_color)
            try:
                probe_difference = ImageChops.difference(probe, expected_probe)
            finally:
                expected_probe.close()
            try:
                red_diff, green_diff, blue_diff = probe_difference.split()
                probe_max_diff = ImageChops.lighter(
                    red_diff, ImageChops.lighter(green_diff, blue_diff)
                )
            finally:
                probe_difference.close()
            try:
                diff_histogram = probe_max_diff.histogram()
            finally:
                probe_max_diff.close()
            cumulative = 0
            probe_pixels = width * probe_height
            tolerance = 0
            for value, count in enumerate(diff_histogram):
                cumulative += count
                if cumulative / probe_pixels >= 0.99:
                    tolerance = value
                    break
            if tolerance > 8:
                return None
            tolerance = max(2, tolerance)
        finally:
            probe.close()

        expected = Image.new("RGB", rgb.size, background_color)
        try:
            difference = ImageChops.difference(rgb, expected)
        finally:
            expected.close()
        try:
            red_diff, green_diff, blue_diff = difference.split()
            max_diff = ImageChops.lighter(
                red_diff, ImageChops.lighter(green_diff, blue_diff)
            )
        finally:
            difference.close()
        try:
            seed = max_diff.point(
                [0 if value <= tolerance else 255 for value in range(256)]
            )
        finally:
            max_diff.close()
        try:
            median_seed = seed.filter(ImageFilter.MedianFilter(3))
        finally:
            seed.close()
        try:
            eroded = median_seed.filter(ImageFilter.MinFilter(3))
        finally:
            median_seed.close()
        try:
            opened = eroded.filter(ImageFilter.MaxFilter(3))
        finally:
            eroded.close()
        recovery_radius = max(2, min(8, round(min(width, height) * 0.008)))
        try:
            return opened.filter(ImageFilter.MaxFilter(recovery_radius * 2 + 1))
        finally:
            opened.close()

    @classmethod
    def _remove_baked_background(cls, rgba: Image.Image) -> bool:
        """Turn a detected checkerboard or neutral backdrop into real alpha."""

        alpha = rgba.getchannel("A")
        try:
            extrema = alpha.getextrema()
            if extrema and extrema[0] < 255:
                return False
        finally:
            alpha.close()

        rgb = rgba.convert("RGB")
        try:
            subject = cls._checkerboard_subject_mask(rgb)
            if subject is None:
                subject = cls._solid_neutral_subject_mask(rgb)
            if subject is None:
                return False
            try:
                subject_pixels = sum(subject.histogram()[1:])
                total_pixels = rgba.width * rgba.height
                if not subject_pixels or total_pixels - subject_pixels < total_pixels * 0.05:
                    return False
                background = ImageChops.invert(subject)
                try:
                    current_alpha = rgba.getchannel("A")
                    try:
                        next_alpha = ImageChops.subtract(current_alpha, background)
                    finally:
                        current_alpha.close()
                    try:
                        rgba.putalpha(next_alpha)
                    finally:
                        next_alpha.close()
                finally:
                    background.close()
            finally:
                subject.close()
        finally:
            rgb.close()
        return True

    def persist_png(
        self,
        raw: bytes,
        *,
        remove_background: bool = False,
        require_transparency: bool = False,
    ) -> tuple[str, Size2, LayerMetadata]:
        if not raw:
            raise ValueError("generation service returned an empty image")
        try:
            with Image.open(io.BytesIO(raw)) as source:
                source.load()
                if source.width <= 0 or source.height <= 0:
                    raise ValueError("invalid image size")
                if source.width > 32768 or source.height > 32768:
                    raise ValueError("generated image is too large")
                rgba = source.convert("RGBA")
        except (UnidentifiedImageError, OSError, SyntaxError, ValueError) as exc:
            raise ValueError("generation service returned an invalid image") from exc

        try:
            if remove_background:
                self._remove_baked_background(rgba)
            alpha = rgba.getchannel("A")
            extrema = alpha.getextrema()
            has_transparent = bool(extrema and extrema[0] < 255)
            alpha_bounds_raw = alpha.getbbox()
            alpha.close()
            if alpha_bounds_raw is None:
                raise ValueError("generated image is fully transparent")
            if require_transparency and not has_transparent:
                raise ValueError(
                    "No removable neutral or checkerboard background was detected"
                )
            left, top, right, bottom = alpha_bounds_raw
            alpha_bounds = {
                "x": left,
                "y": top,
                "width": right - left,
                "height": bottom - top,
            }
            filename = f"layer_{uuid4().hex}.png"
            output_path = self.settings.generated_dir / filename
            rgba.save(output_path, format="PNG", optimize=True)
            size = Size2(width=rgba.width, height=rgba.height)
        finally:
            rgba.close()

        metadata = LayerMetadata(
            mediaType="image/png",
            hasAlphaChannel=True,
            hasTransparentPixels=has_transparent,
            alphaBounds=alpha_bounds,
        )
        return f"/media/generated/{filename}", size, metadata

    def resolve_result_url(self, result_url: str) -> Path:
        match = re.fullmatch(r"/media/generated/([A-Za-z0-9_.-]+)", result_url)
        if not match:
            raise ValueError("resultUrl is not a managed generated asset")
        path = (self.settings.generated_dir / match.group(1)).resolve()
        if not path.is_relative_to(self.settings.generated_dir.resolve()):
            raise ValueError("invalid generated asset path")
        if not path.is_file():
            raise FileNotFoundError("generated asset is missing")
        return path


ROLE_Z_INDEX = {
    LayerRole.sky: 0,
    LayerRole.distant: 10,
    LayerRole.midground: 20,
    LayerRole.foreground: 30,
    LayerRole.atmosphere: 40,
}

ROLE_PROMPT = {
    LayerRole.sky: (
        "Create the requested sky content. A complete sky/base may be opaque, but "
        "isolated clouds or other sky elements must use real transparency. Never "
        "draw a transparency checkerboard."
    ),
    LayerRole.distant: "Create only a distant scenery layer with isolated shapes on a truly transparent background.",
    LayerRole.midground: "Create only a midground scenery layer isolated on a truly transparent background.",
    LayerRole.foreground: "Create only a foreground scenery layer on a truly transparent background.",
    LayerRole.atmosphere: "Create only an atmospheric overlay such as fog, clouds, light or particles on a truly transparent background.",
}


def effective_prompt(request: GenerationJobCreate) -> str:
    transparency = (
        (
            " If the request is for isolated clouds or sky elements, pixels outside "
            "them must have real RGBA alpha=0; do not add a canvas, frame, or card."
        )
        if request.role is LayerRole.sky
        else (
            " Outside the subject, pixels must have real RGBA alpha=0. "
            "Do not draw a transparency checkerboard, white/black/colored backdrop, "
            "canvas, frame, border, card, or mockup."
        )
    )
    return (
        f"{request.prompt}\n\n"
        f"{ROLE_PROMPT[request.role]}{transparency} "
        "2D game scenery asset, PNG, no text, no labels, no border, no mockup. "
        "Keep the visual content suitable for independent compositing as a layer."
    )


class GenerationJobService:
    def __init__(
        self,
        repository: SceneryRepository,
        generation_client: GenerationClient,
        image_service: ImageService,
    ) -> None:
        self.repository = repository
        self.generation_client = generation_client
        self.image_service = image_service

    async def run(self, job_id: str) -> None:
        job = self.repository.get_generation_job(job_id)
        self.repository.update_generation_job(job_id, status="running")
        prompt = effective_prompt(job.request)
        try:
            raw, _media_type = await self.generation_client.generate(prompt)
            result_url, size, metadata = self.image_service.persist_png(
                raw,
                # Detection is deliberately conservative, so it is safe to run
                # for a full sky as well: a real blue sky is left untouched while
                # a baked neutral checkerboard around clouds is converted to alpha.
                remove_background=True,
            )
            metadata = metadata.model_copy(
                update={
                    "role": job.request.role.value,
                    "sourcePrompt": job.request.prompt,
                    "effectivePrompt": prompt,
                }
            )
            scenery = self.repository.get_scenery(job.sceneryId)
            layer = self.repository.create_layer(
                scenery_id=scenery.id,
                project_id=scenery.projectId,
                name=job.request.name,
                description=job.request.prompt,
                result_url=result_url,
                tags=[job.request.role.value, "generated"],
                attributes=LayerAttributes(
                    visible=True,
                    opacity=1,
                    zIndex=ROLE_Z_INDEX[job.request.role],
                    position=Vector2(x=0, y=0),
                    scale=Scale2(x=1, y=1),
                    size=size,
                    rotation=0,
                    repeat=Repeat2(x=False, y=False),
                    speed=Vector2(x=0, y=0),
                    parallax=Vector2(x=0, y=0),
                ),
                metadata=metadata,
            )
            self.repository.update_generation_job(
                job_id, status="completed", layer_id=layer.id
            )
        except Exception as exc:
            logger.warning("generation job failed: job_id=%s type=%s", job_id, type(exc).__name__)
            self.repository.update_generation_job(
                job_id,
                status="failed",
                error={"code": "GENERATION_FAILED", "message": str(exc)},
            )


class ExportService:
    def __init__(
        self, repository: SceneryRepository, image_service: ImageService
    ) -> None:
        self.repository = repository
        self.image_service = image_service

    def payload(self, scenery_id: int) -> dict[str, Any]:
        document = self.repository.document(scenery_id)
        layers: list[dict[str, Any]] = []
        files: list[dict[str, Any]] = []
        for layer in document.layers:
            source = self.image_service.resolve_result_url(layer.resultUrl)
            export_path = f"layers/layer-{layer.id}.png"
            layer_data = layer.model_dump(mode="json")
            layer_data["resultUrl"] = export_path
            layers.append(layer_data)
            files.append(
                {
                    "layerId": layer.id,
                    "path": export_path,
                    "mediaType": "image/png",
                    "sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                }
            )
        return {
            "schemaVersion": "1.0",
            "scenery": document.scenery.model_dump(mode="json"),
            "layers": layers,
            "files": files,
        }

    def zip_bytes(self, scenery_id: int) -> bytes:
        payload = self.payload(scenery_id)
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr(
                "scenery.json",
                json.dumps(payload, ensure_ascii=False, indent=2),
            )
            for layer in self.repository.list_layers(scenery_id):
                source = self.image_service.resolve_result_url(layer.resultUrl)
                archive.write(source, f"layers/layer-{layer.id}.png")
        return buffer.getvalue()
