from collections import defaultdict
from hashlib import sha256
from typing import DefaultDict, Dict, List

from PIL import Image, ImageStat

from app.domain.models import FRAME_COUNT, FRAME_HEIGHT, FRAME_WIDTH, QualityReport


def inspect_frames(frames: List[Image.Image]) -> QualityReport:
    errors: List[str] = []
    warnings: List[str] = []
    details: List[Dict[str, object]] = []
    hashes: DefaultDict[str, List[int]] = defaultdict(list)

    if len(frames) != FRAME_COUNT:
        errors.append(f"expected {FRAME_COUNT} frames, got {len(frames)}")

    for index, frame in enumerate(frames):
        if frame.size != (FRAME_WIDTH, FRAME_HEIGHT):
            errors.append(f"frame {index} has invalid size {frame.width}x{frame.height}")
        rgba = frame.convert("RGBA")
        alpha = rgba.getchannel("A")
        histogram = alpha.histogram()
        alpha_pixels = sum(histogram[1:])
        coverage = alpha_pixels / float(FRAME_WIDTH * FRAME_HEIGHT)
        bbox = alpha.getbbox()
        opaque = alpha.getextrema() == (255, 255)
        if bbox is None or coverage < 0.002:
            errors.append(f"frame {index} is empty or has negligible foreground")
        touches_edge = bool(
            bbox
            and (bbox[0] <= 2 or bbox[1] <= 2 or bbox[2] >= FRAME_WIDTH - 2 or bbox[3] >= FRAME_HEIGHT - 2)
        )
        if touches_edge:
            warnings.append(f"frame {index} foreground touches the cell edge")
        luminance_stddev = round(ImageStat.Stat(rgba.convert("L")).stddev[0], 3)
        digest = sha256(rgba.tobytes()).hexdigest()
        hashes[digest].append(index)
        details.append(
            {
                "index": index,
                "alpha_coverage": round(coverage, 6),
                "foreground_bbox": list(bbox) if bbox else None,
                "fully_opaque": opaque,
                "touches_edge": touches_edge,
                "luminance_stddev": luminance_stddev,
            }
        )

    duplicates = [indices for indices in hashes.values() if len(indices) > 1]
    for group in duplicates:
        errors.append(f"exact duplicate frames detected: {group}")
    return QualityReport(
        structural_passed=not errors,
        errors=errors,
        warnings=warnings,
        frames=details,
        exact_duplicate_groups=duplicates,
    )
