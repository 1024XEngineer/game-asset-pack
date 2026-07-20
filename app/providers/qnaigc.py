import base64
from io import BytesIO
from typing import Any, Dict, Optional

import httpx
from PIL import Image, UnidentifiedImageError

from app.core.config import Settings
from app.domain.models import GeneratedSpriteSheet, SpriteSheetGenerationRequest


class QnaigcProviderError(RuntimeError):
    pass


class QnaigcImageProvider:
    """One request to QNAIGC's OpenAI-compatible image edit endpoint."""

    def __init__(self, settings: Settings, client: Optional[httpx.AsyncClient] = None) -> None:
        self._settings = settings
        self._client = client

    async def generate(self, request: SpriteSheetGenerationRequest) -> GeneratedSpriteSheet:
        if not self._settings.qnaigc_api_key:
            raise QnaigcProviderError("QNAIGC_API_KEY is required when mock provider is disabled")

        payload: Dict[str, Any] = {
            "model": self._settings.qnaigc_model,
            "prompt": request.prompt,
            "image": request.images,
            "n": 1,
            "size": self._settings.qnaigc_size,
            "quality": self._settings.qnaigc_quality,
            "output_format": self._settings.qnaigc_output_format,
        }
        headers = {
            "Authorization": f"Bearer {self._settings.qnaigc_api_key}",
            "Content-Type": "application/json",
        }
        owned_client = self._client is None
        client = self._client or httpx.AsyncClient(timeout=self._settings.qnaigc_timeout_seconds)
        try:
            response = await client.post(
                f"{self._settings.qnaigc_base_url}/v1/images/edits",
                headers=headers,
                json=payload,
            )
            if response.status_code != 200:
                detail = response.text[:1000]
                raise QnaigcProviderError(
                    f"QNAIGC returned HTTP {response.status_code}: {detail}"
                )
            try:
                body = response.json()
            except ValueError as exc:
                raise QnaigcProviderError("QNAIGC response is not valid JSON") from exc
            data = body.get("data")
            if not isinstance(data, list) or len(data) != 1 or not isinstance(data[0], dict):
                raise QnaigcProviderError("QNAIGC must return exactly one generated image")
            item = data[0]
            if item.get("b64_json"):
                try:
                    encoded = item["b64_json"]
                    if not isinstance(encoded, str):
                        raise TypeError("b64_json must be a string")
                    if encoded.startswith("data:"):
                        encoded = encoded.split(",", 1)[1]
                    content = base64.b64decode(encoded, validate=True)
                except (ValueError, TypeError) as exc:
                    raise QnaigcProviderError("QNAIGC returned invalid b64_json") from exc
                source = "b64_json"
            elif item.get("url"):
                image_response = await client.get(item["url"])
                if image_response.status_code != 200:
                    raise QnaigcProviderError(
                        f"generated image URL returned HTTP {image_response.status_code}"
                    )
                content = image_response.content
                source = "url"
            else:
                raise QnaigcProviderError("QNAIGC response contains neither b64_json nor url")
        finally:
            if owned_client:
                await client.aclose()

        try:
            with Image.open(BytesIO(content)) as image:
                image.load()
                width, height = image.size
        except (UnidentifiedImageError, OSError) as exc:
            raise QnaigcProviderError("QNAIGC output is not a decodable image") from exc

        usage = body.get("usage") if isinstance(body.get("usage"), dict) else {}
        return GeneratedSpriteSheet(
            content=content,
            source=source,
            width=width,
            height=height,
            provider_call_count=1,
            usage=usage,
        )
