from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from .models import (
    GenerationJob,
    GenerationJobCreate,
    LayerAsset,
    LayerAttributes,
    LayerMetadata,
    SceneryAsset,
    SceneryCreate,
    SceneryDocument,
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class SceneryRepository:
    def __init__(self, database_path: Path) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.database_path, timeout=30)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        try:
            yield connection
            connection.commit()
        finally:
            connection.close()

    def initialize(self) -> None:
        with self.connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS sceneries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    parent_id INTEGER NOT NULL DEFAULT 0,
                    project_id INTEGER NOT NULL DEFAULT 1,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL DEFAULT '',
                    result_url TEXT NOT NULL DEFAULT '',
                    tags_json TEXT NOT NULL DEFAULT '[]',
                    attributes_json TEXT NOT NULL,
                    revision INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS layers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    parent_id INTEGER NOT NULL REFERENCES sceneries(id) ON DELETE CASCADE,
                    project_id INTEGER NOT NULL DEFAULT 1,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL DEFAULT '',
                    result_url TEXT NOT NULL,
                    tags_json TEXT NOT NULL DEFAULT '[]',
                    attributes_json TEXT NOT NULL,
                    metadata_json TEXT NOT NULL DEFAULT '{}',
                    sibling_order INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS generation_jobs (
                    id TEXT PRIMARY KEY,
                    scenery_id INTEGER NOT NULL REFERENCES sceneries(id) ON DELETE CASCADE,
                    status TEXT NOT NULL,
                    request_json TEXT NOT NULL,
                    layer_id INTEGER REFERENCES layers(id) ON DELETE SET NULL,
                    error_json TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                """
            )

    def create_scenery(self, request: SceneryCreate) -> SceneryAsset:
        now = utc_now()
        with self.connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO sceneries
                    (parent_id, project_id, name, description, result_url,
                     tags_json, attributes_json, revision, created_at, updated_at)
                VALUES (0, ?, ?, ?, '', ?, ?, 1, ?, ?)
                """,
                (
                    request.projectId,
                    request.name,
                    request.description,
                    json.dumps(request.tags, ensure_ascii=False),
                    request.attributes.model_dump_json(),
                    now,
                    now,
                ),
            )
            scenery_id = int(cursor.lastrowid)
        return self.get_scenery(scenery_id)

    def get_scenery(self, scenery_id: int) -> SceneryAsset:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM sceneries WHERE id = ?", (scenery_id,)
            ).fetchone()
        if row is None:
            raise KeyError("scenery not found")
        return self._scenery_from_row(row)

    def get_revision(self, scenery_id: int) -> int:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT revision FROM sceneries WHERE id = ?", (scenery_id,)
            ).fetchone()
        if row is None:
            raise KeyError("scenery not found")
        return int(row["revision"])

    def update_scenery(self, scenery: SceneryAsset) -> SceneryAsset:
        now = utc_now()
        with self.connect() as connection:
            cursor = connection.execute(
                """
                UPDATE sceneries
                SET name = ?, description = ?, tags_json = ?, attributes_json = ?,
                    revision = revision + 1, updated_at = ?
                WHERE id = ?
                """,
                (
                    scenery.name,
                    scenery.description,
                    json.dumps(scenery.tags, ensure_ascii=False),
                    scenery.attributes.model_dump_json(),
                    now,
                    scenery.id,
                ),
            )
        if cursor.rowcount != 1:
            raise KeyError("scenery not found")
        return self.get_scenery(scenery.id)

    def list_layers(self, scenery_id: int) -> list[LayerAsset]:
        self.get_scenery(scenery_id)
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM layers WHERE parent_id = ?", (scenery_id,)
            ).fetchall()
        layers = [self._layer_from_row(row) for row in rows]
        return sorted(
            layers,
            key=lambda layer: (
                layer.attributes.zIndex,
                layer.siblingOrder,
                layer.id,
            ),
        )

    def get_layer(self, layer_id: int) -> LayerAsset:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM layers WHERE id = ?", (layer_id,)
            ).fetchone()
        if row is None:
            raise KeyError("layer not found")
        return self._layer_from_row(row)

    def create_layer(
        self,
        *,
        scenery_id: int,
        project_id: int,
        name: str,
        description: str,
        result_url: str,
        tags: list[str],
        attributes: LayerAttributes,
        metadata: LayerMetadata,
    ) -> LayerAsset:
        self.get_scenery(scenery_id)
        now = utc_now()
        with self.connect() as connection:
            order_row = connection.execute(
                "SELECT COALESCE(MAX(sibling_order), -1) + 1 AS next_order FROM layers WHERE parent_id = ?",
                (scenery_id,),
            ).fetchone()
            sibling_order = int(order_row["next_order"])
            cursor = connection.execute(
                """
                INSERT INTO layers
                    (parent_id, project_id, name, description, result_url,
                     tags_json, attributes_json, metadata_json, sibling_order,
                     created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    scenery_id,
                    project_id,
                    name,
                    description,
                    result_url,
                    json.dumps(tags, ensure_ascii=False),
                    attributes.model_dump_json(),
                    metadata.model_dump_json(),
                    sibling_order,
                    now,
                    now,
                ),
            )
            layer_id = int(cursor.lastrowid)
            self._bump_revision(connection, scenery_id, now)
        return self.get_layer(layer_id)

    def update_layer(self, layer: LayerAsset) -> LayerAsset:
        now = utc_now()
        with self.connect() as connection:
            cursor = connection.execute(
                """
                UPDATE layers
                SET name = ?, description = ?, result_url = ?, tags_json = ?,
                    attributes_json = ?, metadata_json = ?, sibling_order = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                (
                    layer.name,
                    layer.description,
                    layer.resultUrl,
                    json.dumps(layer.tags, ensure_ascii=False),
                    layer.attributes.model_dump_json(),
                    layer.metadata.model_dump_json(),
                    layer.siblingOrder,
                    now,
                    layer.id,
                ),
            )
            if cursor.rowcount == 1:
                self._bump_revision(connection, layer.parentId, now)
        if cursor.rowcount != 1:
            raise KeyError("layer not found")
        return self.get_layer(layer.id)

    def delete_layer(self, layer_id: int) -> int:
        layer = self.get_layer(layer_id)
        now = utc_now()
        with self.connect() as connection:
            connection.execute("DELETE FROM layers WHERE id = ?", (layer_id,))
            self._bump_revision(connection, layer.parentId, now)
        return layer.parentId

    def reorder_layers(self, scenery_id: int, layer_ids: list[int]) -> list[LayerAsset]:
        existing = self.list_layers(scenery_id)
        existing_ids = {layer.id for layer in existing}
        if set(layer_ids) != existing_ids or len(layer_ids) != len(existing):
            raise ValueError("layerIds must contain every layer exactly once")
        by_id = {layer.id: layer for layer in existing}
        now = utc_now()
        with self.connect() as connection:
            for order, layer_id in enumerate(layer_ids):
                attributes = by_id[layer_id].attributes.model_copy(
                    update={"zIndex": order * 10}
                )
                connection.execute(
                    """
                    UPDATE layers
                    SET sibling_order = ?, attributes_json = ?, updated_at = ?
                    WHERE id = ?
                    """,
                    (order, attributes.model_dump_json(), now, layer_id),
                )
            self._bump_revision(connection, scenery_id, now)
        return self.list_layers(scenery_id)

    def document(self, scenery_id: int) -> SceneryDocument:
        return SceneryDocument(
            scenery=self.get_scenery(scenery_id),
            layers=self.list_layers(scenery_id),
            revision=self.get_revision(scenery_id),
        )

    def create_generation_job(
        self, job_id: str, scenery_id: int, request: GenerationJobCreate
    ) -> GenerationJob:
        self.get_scenery(scenery_id)
        now = utc_now()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO generation_jobs
                    (id, scenery_id, status, request_json, created_at, updated_at)
                VALUES (?, ?, 'queued', ?, ?, ?)
                """,
                (job_id, scenery_id, request.model_dump_json(), now, now),
            )
        return self.get_generation_job(job_id)

    def update_generation_job(
        self,
        job_id: str,
        *,
        status: str,
        layer_id: int | None = None,
        error: dict[str, Any] | None = None,
    ) -> GenerationJob:
        now = utc_now()
        with self.connect() as connection:
            cursor = connection.execute(
                """
                UPDATE generation_jobs
                SET status = ?, layer_id = ?, error_json = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    status,
                    layer_id,
                    json.dumps(error, ensure_ascii=False) if error else None,
                    now,
                    job_id,
                ),
            )
        if cursor.rowcount != 1:
            raise KeyError("generation job not found")
        return self.get_generation_job(job_id)

    def get_generation_job(self, job_id: str) -> GenerationJob:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM generation_jobs WHERE id = ?", (job_id,)
            ).fetchone()
        if row is None:
            raise KeyError("generation job not found")
        layer = self.get_layer(int(row["layer_id"])) if row["layer_id"] else None
        return GenerationJob(
            id=str(row["id"]),
            sceneryId=int(row["scenery_id"]),
            status=str(row["status"]),
            request=GenerationJobCreate.model_validate_json(row["request_json"]),
            layer=layer,
            error=json.loads(row["error_json"]) if row["error_json"] else None,
            createdAt=str(row["created_at"]),
            updatedAt=str(row["updated_at"]),
        )

    @staticmethod
    def _bump_revision(
        connection: sqlite3.Connection, scenery_id: int, now: str
    ) -> None:
        connection.execute(
            "UPDATE sceneries SET revision = revision + 1, updated_at = ? WHERE id = ?",
            (now, scenery_id),
        )

    @staticmethod
    def _scenery_from_row(row: sqlite3.Row) -> SceneryAsset:
        return SceneryAsset(
            parentId=int(row["parent_id"]),
            id=int(row["id"]),
            projectId=int(row["project_id"]),
            name=str(row["name"]),
            description=str(row["description"]),
            resultUrl=str(row["result_url"]),
            tags=json.loads(row["tags_json"]),
            attributes=json.loads(row["attributes_json"]),
        )

    @staticmethod
    def _layer_from_row(row: sqlite3.Row) -> LayerAsset:
        return LayerAsset(
            parentId=int(row["parent_id"]),
            id=int(row["id"]),
            projectId=int(row["project_id"]),
            name=str(row["name"]),
            description=str(row["description"]),
            resultUrl=str(row["result_url"]),
            tags=json.loads(row["tags_json"]),
            attributes=json.loads(row["attributes_json"]),
            metadata=json.loads(row["metadata_json"] or "{}"),
            siblingOrder=int(row["sibling_order"]),
        )
