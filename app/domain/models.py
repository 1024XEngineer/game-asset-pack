from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


FRAME_COUNT = 6
GRID_ROWS = 2
GRID_COLUMNS = 3
FRAME_WIDTH = 512
FRAME_HEIGHT = 512
SHEET_WIDTH = GRID_COLUMNS * FRAME_WIDTH
SHEET_HEIGHT = GRID_ROWS * FRAME_HEIGHT


class ReferenceTransport(str, Enum):
    BASE64 = "base64"
    URL = "url"


class ReferenceType(str, Enum):
    SINGLE = "single"
    TURNAROUND = "turnaround"


class AssetKind(str, Enum):
    CHARACTER = "character"
    INTERACTIVE_OBJECT = "interactive_object"
    PROP = "prop"


class AlignmentMode(str, Enum):
    PRESERVE = "preserve"
    BOTTOM_CENTER = "bottom_center"


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass(frozen=True)
class ReferenceInput:
    transport: ReferenceTransport
    reference_type: ReferenceType
    asset_kind: AssetKind
    content: Optional[bytes] = None
    url: Optional[str] = None
    mime_type: Optional[str] = None
    filename: Optional[str] = None


@dataclass(frozen=True)
class GenerateAnimationCommand:
    reference: ReferenceInput
    action_prompt: str
    action_name: Optional[str]
    fps: int
    loop: bool
    alignment_mode: AlignmentMode


@dataclass(frozen=True)
class FrameRect:
    x: int
    y: int
    width: int = FRAME_WIDTH
    height: int = FRAME_HEIGHT


@dataclass(frozen=True)
class FrameManifest:
    index: int
    phase: str
    row: int
    column: int
    source_rect: FrameRect


@dataclass
class AnimationManifest:
    version: str
    action_prompt: str
    action_name: Optional[str]
    frame_count: int
    fps: int
    loop: bool
    ordering: str
    sheet: Dict[str, Any]
    frames: List[FrameManifest]
    generation: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def build_manifest(command: GenerateAnimationCommand) -> AnimationManifest:
    frames: List[FrameManifest] = []
    for index in range(FRAME_COUNT):
        row, column = divmod(index, GRID_COLUMNS)
        frames.append(
            FrameManifest(
                index=index,
                phase=f"phase_{index + 1:02d}",
                row=row,
                column=column,
                source_rect=FrameRect(x=column * FRAME_WIDTH, y=row * FRAME_HEIGHT),
            )
        )
    return AnimationManifest(
        version="1.0",
        action_prompt=command.action_prompt,
        action_name=command.action_name,
        frame_count=FRAME_COUNT,
        fps=command.fps,
        loop=command.loop,
        ordering="row-major",
        sheet={
            "width": SHEET_WIDTH,
            "height": SHEET_HEIGHT,
            "rows": GRID_ROWS,
            "columns": GRID_COLUMNS,
            "frame_width": FRAME_WIDTH,
            "frame_height": FRAME_HEIGHT,
        },
        frames=frames,
    )


@dataclass(frozen=True)
class SpriteSheetGenerationRequest:
    prompt: str
    images: List[str]


@dataclass(frozen=True)
class GeneratedSpriteSheet:
    content: bytes
    source: str
    width: int
    height: int
    provider_call_count: int
    usage: Dict[str, Any] = field(default_factory=dict)


@dataclass
class QualityReport:
    structural_passed: bool
    errors: List[str]
    warnings: List[str]
    frames: List[Dict[str, Any]]
    exact_duplicate_groups: List[List[int]]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

