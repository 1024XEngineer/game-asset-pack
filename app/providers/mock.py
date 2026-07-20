from io import BytesIO

from PIL import Image, ImageDraw

from app.domain.models import (
    FRAME_HEIGHT,
    FRAME_WIDTH,
    GRID_COLUMNS,
    SHEET_HEIGHT,
    SHEET_WIDTH,
    GeneratedSpriteSheet,
    SpriteSheetGenerationRequest,
)


class MockImageProvider:
    """Deterministic local provider for API and post-processing verification."""

    async def generate(self, request: SpriteSheetGenerationRequest) -> GeneratedSpriteSheet:
        image = Image.new("RGBA", (SHEET_WIDTH, SHEET_HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        colors = [
            (234, 86, 86, 255),
            (239, 151, 65, 255),
            (231, 205, 68, 255),
            (89, 184, 108, 255),
            (72, 137, 221, 255),
            (145, 94, 211, 255),
        ]
        for index, color in enumerate(colors):
            row, column = divmod(index, GRID_COLUMNS)
            ox, oy = column * FRAME_WIDTH, row * FRAME_HEIGHT
            center_x = ox + FRAME_WIDTH // 2 + (index - 2) * 6
            bottom = oy + 430 - (index % 2) * 8
            draw.ellipse((center_x - 46, bottom - 310, center_x + 46, bottom - 218), fill=color)
            draw.rounded_rectangle(
                (center_x - 65, bottom - 225, center_x + 65, bottom - 65),
                radius=28,
                fill=color,
            )
            stride = (index % 3 - 1) * 22
            draw.line((center_x - 28, bottom - 70, center_x - 38 - stride, bottom), fill=color, width=25)
            draw.line((center_x + 28, bottom - 70, center_x + 38 + stride, bottom), fill=color, width=25)
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        return GeneratedSpriteSheet(
            content=buffer.getvalue(),
            source="mock",
            width=SHEET_WIDTH,
            height=SHEET_HEIGHT,
            provider_call_count=1,
            usage={},
        )
