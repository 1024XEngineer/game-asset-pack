from statistics import median
from typing import List, Tuple

from PIL import Image

from app.domain.models import AlignmentMode, FRAME_HEIGHT, FRAME_WIDTH


def align_frames(
    frames: List[Image.Image], mode: AlignmentMode
) -> Tuple[List[Image.Image], List[str]]:
    if mode == AlignmentMode.PRESERVE:
        return [frame.copy() for frame in frames], []

    boxes = [frame.getchannel("A").getbbox() for frame in frames]
    if any(box is None for box in boxes):
        return [frame.copy() for frame in frames], [
            "bottom_center alignment skipped because at least one frame has no alpha foreground"
        ]
    if any(box == (0, 0, FRAME_WIDTH, FRAME_HEIGHT) for box in boxes):
        return [frame.copy() for frame in frames], [
            "bottom_center alignment skipped because output is fully opaque; transparent foreground is required"
        ]

    valid_boxes = [box for box in boxes if box is not None]
    target_x = int(median([(box[0] + box[2]) / 2 for box in valid_boxes]))
    target_bottom = int(median([box[3] for box in valid_boxes]))
    aligned: List[Image.Image] = []
    warnings: List[str] = []
    for index, (frame, box) in enumerate(zip(frames, valid_boxes)):
        center_x = (box[0] + box[2]) / 2
        dx, dy = round(target_x - center_x), target_bottom - box[3]
        shifted_box = (box[0] + dx, box[1] + dy, box[2] + dx, box[3] + dy)
        if shifted_box[0] < 0 or shifted_box[1] < 0 or shifted_box[2] > FRAME_WIDTH or shifted_box[3] > FRAME_HEIGHT:
            warnings.append(f"frame {index} alignment would clip foreground; original position preserved")
            aligned.append(frame.copy())
            continue
        canvas = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        canvas.alpha_composite(frame, dest=(dx, dy))
        aligned.append(canvas)
    return aligned, warnings

