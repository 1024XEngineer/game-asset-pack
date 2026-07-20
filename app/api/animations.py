from io import BytesIO
from typing import Any, Dict, Optional
from urllib.parse import urlparse

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, Request, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

from app.domain.models import (
    AlignmentMode,
    AssetKind,
    GenerateAnimationCommand,
    JobStatus,
    ReferenceInput,
    ReferenceTransport,
    ReferenceType,
)


router = APIRouter(prefix="/v1/animations", tags=["animations"])


class JobResponse(BaseModel):
    job_id: str
    status: str
    stage: str
    progress: int
    created_at: str
    updated_at: str
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None


@router.post("/generate", status_code=202, response_model=JobResponse)
async def generate_animation(
    request: Request,
    background_tasks: BackgroundTasks,
    action_prompt: str = Form(...),
    reference_transport: ReferenceTransport = Form(ReferenceTransport.BASE64),
    reference_image: Optional[UploadFile] = File(None),
    reference_url: Optional[str] = Form(None),
    reference_type: ReferenceType = Form(ReferenceType.SINGLE),
    asset_kind: AssetKind = Form(AssetKind.CHARACTER),
    action_name: Optional[str] = Form(None),
    fps: int = Form(8, ge=1, le=50),
    loop: bool = Form(True),
    alignment_mode: AlignmentMode = Form(AlignmentMode.PRESERVE),
) -> Dict[str, Any]:
    prompt = action_prompt.strip()
    if not prompt:
        raise HTTPException(status_code=422, detail="action_prompt must not be empty")
    if len(prompt) > 4000:
        raise HTTPException(status_code=422, detail="action_prompt must be at most 4000 characters")

    if reference_transport == ReferenceTransport.BASE64:
        if reference_image is None:
            raise HTTPException(
                status_code=422,
                detail="reference_image is required when reference_transport=base64",
            )
        content = await reference_image.read(request.app.state.settings.max_upload_bytes + 1)
        if len(content) > request.app.state.settings.max_upload_bytes:
            raise HTTPException(status_code=413, detail="reference image exceeds upload size limit")
        mime_type = _validate_image(content)
        reference = ReferenceInput(
            transport=reference_transport,
            reference_type=reference_type,
            asset_kind=asset_kind,
            content=content,
            mime_type=mime_type,
            filename=reference_image.filename,
        )
    else:
        value = (reference_url or "").strip()
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise HTTPException(
                status_code=422,
                detail="a valid http(s) reference_url is required when reference_transport=url",
            )
        reference = ReferenceInput(
            transport=reference_transport,
            reference_type=reference_type,
            asset_kind=asset_kind,
            url=value,
        )

    command = GenerateAnimationCommand(
        reference=reference,
        action_prompt=prompt,
        action_name=(action_name or "").strip() or None,
        fps=fps,
        loop=loop,
        alignment_mode=alignment_mode,
    )
    job = await request.app.state.jobs.create()
    background_tasks.add_task(request.app.state.animation_service.run_job, job.job_id, command)
    return job.to_dict()


@router.get("/{job_id}", response_model=JobResponse)
async def get_animation_job(job_id: str, request: Request) -> Dict[str, Any]:
    job = await request.app.state.jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="animation job not found")
    return job.to_dict()


@router.get("/{job_id}/assets")
async def get_animation_assets(job_id: str, request: Request) -> Dict[str, Any]:
    job = await request.app.state.jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="animation job not found")
    if job.status != JobStatus.COMPLETED.value:
        raise HTTPException(
            status_code=409,
            detail={"status": job.status, "stage": job.stage, "error": job.error},
        )
    return job.result or {}


def _validate_image(content: bytes) -> str:
    if not content:
        raise HTTPException(status_code=422, detail="reference image is empty")
    try:
        with Image.open(BytesIO(content)) as image:
            image.verify()
            image_format = (image.format or "").upper()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=422, detail="reference_image is not a valid image") from exc
    formats = {"PNG": "image/png", "JPEG": "image/jpeg", "WEBP": "image/webp"}
    if image_format not in formats:
        raise HTTPException(status_code=422, detail="only PNG, JPEG, and WEBP references are supported")
    return formats[image_format]

