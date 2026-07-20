from io import BytesIO
from typing import List, Tuple

from PIL import Image, UnidentifiedImageError

from app.domain.models import (
    FRAME_COUNT,
    FRAME_HEIGHT,
    FRAME_WIDTH,
    GRID_COLUMNS,
    SHEET_HEIGHT,
    SHEET_WIDTH,
)


class SpriteSheetError(RuntimeError):
    pass


def decode_and_split(content: bytes) -> Tuple[Image.Image, List[Image.Image]]:
    try:
        with Image.open(BytesIO(content)) as source:
            source.load()
            sheet = source.convert("RGBA")
    except (UnidentifiedImageError, OSError) as exc:
        raise SpriteSheetError("generated sprite sheet is not a decodable image") from exc

    if sheet.size != (SHEET_WIDTH, SHEET_HEIGHT):
        raise SpriteSheetError(
            f"generated sheet must be exactly {SHEET_WIDTH}x{SHEET_HEIGHT}; got "
            f"{sheet.width}x{sheet.height}. Automatic stretching is intentionally disabled."
        )

    frames: List[Image.Image] = []
    for index in range(FRAME_COUNT):
        row, column = divmod(index, GRID_COLUMNS)
        left, top = column * FRAME_WIDTH, row * FRAME_HEIGHT
        frames.append(sheet.crop((left, top, left + FRAME_WIDTH, top + FRAME_HEIGHT)))
    return sheet, frames


def encode_png(image: Image.Image) -> bytes:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()

