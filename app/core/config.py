from dataclasses import dataclass
from functools import lru_cache
import os
from pathlib import Path

from dotenv import load_dotenv


def _as_bool(value: str, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    server_host: str = "127.0.0.1"
    server_port: int = 8080
    output_dir: Path = Path("outputs")
    public_base_url: str = ""
    max_upload_bytes: int = 10 * 1024 * 1024
    animation_mock_provider: bool = True
    qnaigc_base_url: str = "https://api.qnaigc.com"
    qnaigc_api_key: str = ""
    qnaigc_model: str = "openai/gpt-image-2"
    qnaigc_size: str = "1536x1024"
    qnaigc_quality: str = "low"
    qnaigc_output_format: str = "png"
    qnaigc_timeout_seconds: float = 240.0

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv()
        return cls(
            server_host=os.getenv("SERVER_HOST", "127.0.0.1"),
            server_port=int(os.getenv("SERVER_PORT", "8080")),
            output_dir=Path(os.getenv("OUTPUT_DIR", "./outputs")),
            public_base_url=os.getenv("PUBLIC_BASE_URL", "").rstrip("/"),
            max_upload_bytes=int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024))),
            animation_mock_provider=_as_bool(os.getenv("ANIMATION_MOCK_PROVIDER"), True),
            qnaigc_base_url=os.getenv("QNAIGC_BASE_URL", "https://api.qnaigc.com").rstrip("/"),
            qnaigc_api_key=os.getenv("QNAIGC_API_KEY", ""),
            qnaigc_model=os.getenv("QNAIGC_MODEL", "openai/gpt-image-2"),
            qnaigc_size=os.getenv("QNAIGC_SIZE", "1536x1024"),
            qnaigc_quality=os.getenv("QNAIGC_QUALITY", "low"),
            qnaigc_output_format=os.getenv("QNAIGC_OUTPUT_FORMAT", "png"),
            qnaigc_timeout_seconds=float(os.getenv("QNAIGC_TIMEOUT_SECONDS", "240")),
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_env()
