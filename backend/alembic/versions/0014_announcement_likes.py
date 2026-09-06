"""add announcement_likes table for per-user toggleable likes

Revision ID: 0014
Revises: 0013
Create Date: 2026-09-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0014"
down_revision: Union[str, None] = "0013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "announcement_likes",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column(
            "announcement_id", sa.String(),
            sa.ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("announcement_id", "user_id", name="uq_announcement_likes_announcement_user"),
    )
    op.create_index("ix_announcement_likes_announcement_id", "announcement_likes", ["announcement_id"])
    op.create_index("ix_announcement_likes_user_id", "announcement_likes", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_announcement_likes_user_id", table_name="announcement_likes")
    op.drop_index("ix_announcement_likes_announcement_id", table_name="announcement_likes")
    op.drop_table("announcement_likes")
