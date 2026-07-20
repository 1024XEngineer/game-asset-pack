from __future__ import annotations

from enum import Enum
from math import isfinite
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Vector2(StrictModel):
    x: float = 0
    y: float = 0

    @model_validator(mode="after")
    def finite_values(self) -> "Vector2":
        if not isfinite(self.x) or not isfinite(self.y):
            raise ValueError("vector values must be finite")
        return self


class Scale2(StrictModel):
    x: float = Field(default=1, gt=0, le=100)
    y: float = Field(default=1, gt=0, le=100)


class Size2(StrictModel):
    width: int = Field(gt=0, le=32768)
    height: int = Field(gt=0, le=32768)


class Repeat2(StrictModel):
    x: bool = False
    y: bool = False


class SceneryAttributes(StrictModel):
    width: int = Field(default=1920, gt=0, le=32768)
    height: int = Field(default=1080, gt=0, le=32768)


class LayerAttributes(StrictModel):
    visible: bool = True
    opacity: float = Field(default=1, ge=0, le=1)
    zIndex: int = Field(default=0, ge=-100000, le=100000)
    position: Vector2 = Field(default_factory=Vector2)
    scale: Scale2 = Field(default_factory=Scale2)
    size: Size2
    rotation: float = Field(default=0, ge=-360000, le=360000)
    repeat: Repeat2 = Field(default_factory=Repeat2)
    speed: Vector2 = Field(default_factory=Vector2)
    parallax: Vector2 = Field(default_factory=Vector2)

    @field_validator("rotation")
    @classmethod
    def finite_rotation(cls, value: float) -> float:
        if not isfinite(value):
            raise ValueError("rotation must be finite")
        return value


class LayerMetadata(StrictModel):
    role: str = "midground"
    sourcePrompt: str = ""
    effectivePrompt: str = ""
    mediaType: str = "image/png"
    hasAlphaChannel: bool = True
    hasTransparentPixels: bool = False
    alphaBounds: dict[str, int] | None = None


class SceneryAsset(StrictModel):
    parentId: int = 0
    id: int
    projectId: int = 1
    name: str
    type: Literal["scenery"] = "scenery"
    description: str = ""
    resultUrl: str = ""
    tags: list[str] = Field(default_factory=list)
    attributes: SceneryAttributes


class LayerAsset(StrictModel):
    parentId: int
    id: int
    projectId: int = 1
    name: str
    type: Literal["layer"] = "layer"
    description: str = ""
    resultUrl: str
    tags: list[str] = Field(default_factory=list)
    attributes: LayerAttributes
    metadata: LayerMetadata = Field(default_factory=LayerMetadata)
    siblingOrder: int = 0


class SceneryDocument(StrictModel):
    scenery: SceneryAsset
    layers: list[LayerAsset]
    revision: int


class SceneryCreate(StrictModel):
    projectId: int = 1
    name: str = Field(default="Untitled Scenery", min_length=1, max_length=160)
    description: str = Field(default="", max_length=4000)
    tags: list[str] = Field(default_factory=list, max_length=64)
    attributes: SceneryAttributes = Field(default_factory=SceneryAttributes)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("name cannot be empty")
        return value


class SceneryPatch(StrictModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=4000)
    tags: list[str] | None = Field(default=None, max_length=64)
    attributes: dict[str, Any] | None = None


class LayerPatch(StrictModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=4000)
    tags: list[str] | None = Field(default=None, max_length=64)
    attributes: dict[str, Any] | None = None


class LayerCreate(StrictModel):
    name: str = Field(min_length=1, max_length=160)
    resultUrl: str = Field(min_length=1, max_length=2048)
    description: str = Field(default="", max_length=4000)
    tags: list[str] = Field(default_factory=list)
    attributes: LayerAttributes
    metadata: LayerMetadata = Field(default_factory=LayerMetadata)


class LayerOrderRequest(StrictModel):
    layerIds: list[int] = Field(min_length=1)

    @field_validator("layerIds")
    @classmethod
    def unique_ids(cls, value: list[int]) -> list[int]:
        if len(value) != len(set(value)):
            raise ValueError("layerIds must be unique")
        return value


class LayerRole(str, Enum):
    sky = "sky"
    distant = "distant"
    midground = "midground"
    foreground = "foreground"
    atmosphere = "atmosphere"


class GenerationJobCreate(StrictModel):
    name: str = Field(default="Generated layer", min_length=1, max_length=160)
    prompt: str = Field(min_length=1, max_length=32000)
    role: LayerRole = LayerRole.midground

    @field_validator("name", "prompt")
    @classmethod
    def clean_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("value cannot be empty")
        return value


class GenerationJob(StrictModel):
    id: str
    sceneryId: int
    status: Literal["queued", "running", "completed", "failed"]
    request: GenerationJobCreate
    layer: LayerAsset | None = None
    error: dict[str, Any] | None = None
    createdAt: str
    updatedAt: str


def deep_merge(current: dict[str, Any], patch: dict[str, Any]) -> dict[str, Any]:
    merged = dict(current)
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged

