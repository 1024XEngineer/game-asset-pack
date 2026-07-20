import asyncio
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import uuid4

from app.domain.models import JobStatus


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class JobRecord:
    job_id: str
    status: str
    stage: str
    progress: int
    created_at: str
    updated_at: str
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class InMemoryJobStore:
    def __init__(self) -> None:
        self._jobs: Dict[str, JobRecord] = {}
        self._lock = asyncio.Lock()

    async def create(self) -> JobRecord:
        timestamp = _now()
        record = JobRecord(
            job_id=f"anim-{uuid4().hex[:16]}",
            status=JobStatus.QUEUED.value,
            stage="queued",
            progress=0,
            created_at=timestamp,
            updated_at=timestamp,
        )
        async with self._lock:
            self._jobs[record.job_id] = record
        return record

    async def get(self, job_id: str) -> Optional[JobRecord]:
        async with self._lock:
            record = self._jobs.get(job_id)
            return JobRecord(**record.to_dict()) if record else None

    async def update(self, job_id: str, **changes: Any) -> JobRecord:
        async with self._lock:
            record = self._jobs[job_id]
            for name, value in changes.items():
                setattr(record, name, value)
            record.updated_at = _now()
            return JobRecord(**record.to_dict())

