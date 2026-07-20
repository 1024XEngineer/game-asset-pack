from __future__ import annotations

import io
from contextlib import asynccontextmanager
from copy import deepcopy
from pathlib import Path
from uuid import uuid4

from fastapi import BackgroundTasks, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from .models import (
    GenerationJob,
    GenerationJobCreate,
    LayerAsset,
    LayerAttributes,
    LayerCreate,
    LayerOrderRequest,
    LayerPatch,
    SceneryAsset,
    SceneryCreate,
    SceneryDocument,
    SceneryPatch,
    deep_merge,
)
from .repository import SceneryRepository
from .services import (
    ExportService,
    GenerationClient,
    GenerationJobService,
    ImageService,
    Settings,
)


def create_app(
    settings: Settings | None = None,
    generation_client: GenerationClient | None = None,
) -> FastAPI:
    app_settings = settings or Settings.from_environment()
    app_settings.data_dir.mkdir(parents=True, exist_ok=True)
    app_settings.generated_dir.mkdir(parents=True, exist_ok=True)
    app_settings.exports_dir.mkdir(parents=True, exist_ok=True)

    repository = SceneryRepository(app_settings.database_path)
    repository.initialize()
    image_service = ImageService(app_settings)
    client = generation_client or GenerationClient(app_settings)
    generation_service = GenerationJobService(repository, client, image_service)
    export_service = ExportService(repository, image_service)

    @asynccontextmanager
    async def lifespan(_application: FastAPI):
        repository.initialize()
        yield

    application = FastAPI(
        title="Layer-based Scenery API",
        version="1.0.0",
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            app_settings.frontend_origin,
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.state.settings = app_settings
    application.state.repository = repository
    application.state.generation_service = generation_service
    application.state.export_service = export_service

    @application.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @application.post(
        "/api/v1/sceneries",
        response_model=SceneryAsset,
        status_code=status.HTTP_201_CREATED,
        tags=["sceneries"],
    )
    async def create_scenery(body: SceneryCreate) -> SceneryAsset:
        return repository.create_scenery(body)

    @application.get(
        "/api/v1/sceneries/{scenery_id}/document",
        response_model=SceneryDocument,
        tags=["sceneries"],
    )
    async def get_scenery_document(scenery_id: int) -> SceneryDocument:
        try:
            return repository.document(scenery_id)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Scenery not found") from exc

    @application.patch(
        "/api/v1/sceneries/{scenery_id}",
        response_model=SceneryAsset,
        tags=["sceneries"],
    )
    async def patch_scenery(scenery_id: int, body: SceneryPatch) -> SceneryAsset:
        try:
            current = repository.get_scenery(scenery_id)
            data = current.model_dump(mode="json")
            patch = body.model_dump(exclude_none=True)
            if "attributes" in patch:
                patch["attributes"] = deep_merge(data["attributes"], patch["attributes"])
            data.update(patch)
            updated = SceneryAsset.model_validate(data)
            return repository.update_scenery(updated)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Scenery not found") from exc
        except ValidationError as exc:
            raise HTTPException(status_code=422, detail=exc.errors()) from exc

    @application.post(
        "/api/v1/sceneries/{scenery_id}/layers",
        response_model=LayerAsset,
        status_code=status.HTTP_201_CREATED,
        tags=["layers"],
    )
    async def create_layer(scenery_id: int, body: LayerCreate) -> LayerAsset:
        try:
            scenery = repository.get_scenery(scenery_id)
            return repository.create_layer(
                scenery_id=scenery_id,
                project_id=scenery.projectId,
                name=body.name,
                description=body.description,
                result_url=body.resultUrl,
                tags=body.tags,
                attributes=body.attributes,
                metadata=body.metadata,
            )
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Scenery not found") from exc

    @application.patch(
        "/api/v1/layers/{layer_id}", response_model=LayerAsset, tags=["layers"]
    )
    async def patch_layer(layer_id: int, body: LayerPatch) -> LayerAsset:
        try:
            current = repository.get_layer(layer_id)
            data = current.model_dump(mode="json")
            patch = body.model_dump(exclude_none=True)
            if "attributes" in patch:
                patch["attributes"] = deep_merge(data["attributes"], patch["attributes"])
            data.update(patch)
            data["attributes"] = LayerAttributes.model_validate(data["attributes"])
            updated = LayerAsset.model_validate(data)
            return repository.update_layer(updated)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Layer not found") from exc
        except ValidationError as exc:
            raise HTTPException(status_code=422, detail=exc.errors()) from exc

    @application.post(
        "/api/v1/layers/{layer_id}/remove-background",
        response_model=LayerAsset,
        tags=["layers"],
    )
    async def remove_layer_background(layer_id: int) -> LayerAsset:
        try:
            layer = repository.get_layer(layer_id)
            source = image_service.resolve_result_url(layer.resultUrl)
            result_url, size, processed = image_service.persist_png(
                source.read_bytes(),
                remove_background=True,
                require_transparency=True,
            )
            metadata = layer.metadata.model_copy(
                update={
                    "mediaType": processed.mediaType,
                    "hasAlphaChannel": processed.hasAlphaChannel,
                    "hasTransparentPixels": processed.hasTransparentPixels,
                    "alphaBounds": processed.alphaBounds,
                }
            )
            attributes = layer.attributes.model_copy(update={"size": size})
            updated = layer.model_copy(
                update={
                    "resultUrl": result_url,
                    "attributes": attributes,
                    "metadata": metadata,
                }
            )
            return repository.update_layer(updated)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Layer not found") from exc
        except (FileNotFoundError, ValueError) as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @application.delete(
        "/api/v1/layers/{layer_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["layers"]
    )
    async def delete_layer(layer_id: int) -> Response:
        try:
            repository.delete_layer(layer_id)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Layer not found") from exc
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @application.put(
        "/api/v1/sceneries/{scenery_id}/layer-order",
        response_model=list[LayerAsset],
        tags=["layers"],
    )
    async def reorder_layers(
        scenery_id: int, body: LayerOrderRequest
    ) -> list[LayerAsset]:
        try:
            return repository.reorder_layers(scenery_id, body.layerIds)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Scenery not found") from exc
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @application.post(
        "/api/v1/sceneries/{scenery_id}/generation-jobs",
        response_model=GenerationJob,
        status_code=status.HTTP_202_ACCEPTED,
        tags=["generation"],
    )
    async def create_generation_job(
        scenery_id: int,
        body: GenerationJobCreate,
        background_tasks: BackgroundTasks,
    ) -> GenerationJob:
        job_id = f"gen_{uuid4().hex}"
        try:
            job = repository.create_generation_job(job_id, scenery_id, body)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Scenery not found") from exc
        background_tasks.add_task(generation_service.run, job_id)
        return job

    @application.get(
        "/api/v1/generation-jobs/{job_id}",
        response_model=GenerationJob,
        tags=["generation"],
    )
    async def get_generation_job(job_id: str) -> GenerationJob:
        try:
            return repository.get_generation_job(job_id)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Generation job not found") from exc

    @application.get(
        "/api/v1/sceneries/{scenery_id}/export.json", tags=["export"]
    )
    async def export_json(scenery_id: int) -> JSONResponse:
        try:
            return JSONResponse(export_service.payload(scenery_id))
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Scenery not found") from exc
        except (FileNotFoundError, ValueError) as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @application.get(
        "/api/v1/sceneries/{scenery_id}/export.zip", tags=["export"]
    )
    async def export_zip(scenery_id: int) -> StreamingResponse:
        try:
            scenery = repository.get_scenery(scenery_id)
            content = export_service.zip_bytes(scenery_id)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Scenery not found") from exc
        except (FileNotFoundError, ValueError) as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        safe_name = "".join(
            character if character.isalnum() or character in "-_" else "-"
            for character in scenery.name.lower()
        ).strip("-") or f"scenery-{scenery.id}"
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}.zip"'
            },
        )

    application.mount(
        "/media", StaticFiles(directory=str(app_settings.data_dir)), name="media"
    )
    return application


app = create_app()
