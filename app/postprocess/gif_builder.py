from io import BytesIO
from typing import List

from PIL import Image


def build_gif(frames: List[Image.Image], fps: int, loop: bool) -> bytes:
    if not frames:
        raise ValueError("cannot build GIF without frames")
    duration_ms = max(1, round(1000 / fps))
    converted = [frame.convert("RGBA") for frame in frames]
    buffer = BytesIO()
    options = {
        "format": "GIF",
        "save_all": True,
        "append_images": converted[1:],
        "duration": duration_ms,
        "disposal": 2,
        "optimize": False,
    }
    if loop:
        options["loop"] = 0
    converted[0].save(buffer, **options)
    return buffer.getvalue()
