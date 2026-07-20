from pathlib import Path


class LocalAssetStorage:
    def __init__(self, root: Path, public_base_url: str = "") -> None:
        self.root = root.resolve()
        self.public_base_url = public_base_url.rstrip("/")
        self.root.mkdir(parents=True, exist_ok=True)

    def prepare_job(self, job_id: str) -> Path:
        path = self._safe_path(job_id)
        path.mkdir(parents=True, exist_ok=True)
        return path

    def save(self, job_id: str, relative_path: str, content: bytes) -> Path:
        target = self._safe_path(job_id, relative_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return target

    def url(self, job_id: str, relative_path: str) -> str:
        suffix = f"/outputs/{job_id}/{relative_path.replace(chr(92), '/')}"
        return f"{self.public_base_url}{suffix}" if self.public_base_url else suffix

    def _safe_path(self, *parts: str) -> Path:
        target = self.root.joinpath(*parts).resolve()
        try:
            target.relative_to(self.root)
        except ValueError as exc:
            raise ValueError("asset path escapes output directory") from exc
        return target

