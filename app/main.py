from typing import Optional

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.animations import router as animations_router
from app.core.config import Settings, get_settings
from app.providers.base import SpriteSheetProvider
from app.providers.mock import MockImageProvider
from app.providers.qnaigc import QnaigcImageProvider
from app.services.animation import AnimationGenerationService
from app.services.job_store import InMemoryJobStore
from app.services.storage import LocalAssetStorage


def create_app(
    settings: Optional[Settings] = None,
    provider: Optional[SpriteSheetProvider] = None,
) -> FastAPI:
    resolved_settings = settings or get_settings()
    storage = LocalAssetStorage(
        resolved_settings.output_dir,
        public_base_url=resolved_settings.public_base_url,
    )
    jobs = InMemoryJobStore()
    resolved_provider = provider or (
        MockImageProvider()
        if resolved_settings.animation_mock_provider
        else QnaigcImageProvider(resolved_settings)
    )
    animation_service = AnimationGenerationService(resolved_provider, storage, jobs)

    application = FastAPI(
        title="Animation Frame Feasibility API",
        version="0.1.0",
        description=(
            "Independent FastAPI prototype: one reference plus a user action prompt produces "
            "one fixed 3x2 sprite sheet, six PNG frames, and one GIF."
        ),
    )
    application.state.settings = resolved_settings
    application.state.jobs = jobs
    application.state.animation_service = animation_service
    application.state.provider = resolved_provider
    application.include_router(animations_router)
    application.mount("/outputs", StaticFiles(directory=str(storage.root)), name="outputs")

    @application.get("/health")
    async def health() -> dict:
        return {
            "status": "ok",
            "provider": type(resolved_provider).__name__,
            "model": resolved_settings.qnaigc_model,
        }

    return application


app = create_app()
