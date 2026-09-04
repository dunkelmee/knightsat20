"""add per-user entrance QR check-in code and check-in status

Revision ID: 0013
Revises: 0012
Create Date: 2026-09-04

"""
import uuid
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0013"
down_revision: Union[str, None] = "0012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("checkin_code", sa.String(), nullable=True))
    op.add_column("users", sa.Column("checked_in_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "users",
        sa.Column("checked_in_plus_one", sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id FROM users")).fetchall()
    for (user_id,) in rows:
        conn.execute(
            sa.text("UPDATE users SET checkin_code = :code WHERE id = :id"),
            {"code": uuid.uuid4().hex, "id": user_id},
        )

    op.alter_column("users", "checkin_code", nullable=False)
    op.create_unique_constraint("uq_users_checkin_code", "users", ["checkin_code"])
    op.create_index("ix_users_checkin_code", "users", ["checkin_code"])


def downgrade() -> None:
    op.drop_index("ix_users_checkin_code", table_name="users")
    op.drop_constraint("uq_users_checkin_code", "users", type_="unique")
    op.drop_column("users", "checked_in_plus_one")
    op.drop_column("users", "checked_in_at")
    op.drop_column("users", "checkin_code")
