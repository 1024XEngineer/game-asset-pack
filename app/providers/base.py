from typing import Protocol

from app.domain.models import GeneratedSpriteSheet, SpriteSheetGenerationRequest


class SpriteSheetProvider(Protocol):
    async def generate(self, request: SpriteSheetGenerationRequest) -> GeneratedSpriteSheet:
        ...

