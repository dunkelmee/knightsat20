"""backfill base64 then/now photos to file storage

Revision ID: 0009
Revises: 0008
Create Date: 2026-08-28

"""
import base64
import re
import uuid
from pathlib import Path
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from app.config import get_settings

# revision identifiers, used by Alembic.
revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_DATA_URI_RE = re.compile(r"^data:image/(\w+);base64,(.+)$", re.DOTALL)
_ALLOWED_EXTS = {"jpeg", "jpg", "png", "gif", "webp"}


def _migrate_column(conn, column: str) -> None:
    uploads_dir = Path(get_settings().uploads_dir)
    rows = conn.execute(
        sa.text(f"SELECT id, {column} FROM users WHERE {column} LIKE 'data:%'")
    ).fetchall()

    for user_id, data_uri in rows:
        match = _DATA_URI_RE.match(data_uri or "")
        if not match:
            continue
        ext = match.group(1).lower()
        if ext not in _ALLOWED_EXTS:
            ext = "jpg"
        raw_bytes = base64.b64decode(match.group(2))

        key = f"profiles/{user_id}/{uuid.uuid4()}.{ext}"
        photo_path = uploads_dir / key
        photo_path.parent.mkdir(parents=True, exist_ok=True)
        photo_path.write_bytes(raw_bytes)

        conn.execute(
            sa.text(f"UPDATE users SET {column} = :key WHERE id = :id"),
            {"key": key, "id": user_id},
        )


def upgrade() -> None:
    conn = op.get_bind()
    _migrate_column(conn, "then_photo_url")
    _migrate_column(conn, "now_photo_url")


def downgrade() -> None:
    # Irreversible: the original base64 payloads aren't recoverable from the
    # files written to disk, so there's nothing to restore into the column.
    pass
