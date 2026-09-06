"""tag batchmates in album photos

Photos already carry a caption column (unused until now — it's editable by the
uploader from the lightbox). This adds the many-to-many between a photo and the
batchmates in it. Both FKs cascade: deleting a photo or an account takes its
tags with it rather than leaving dangling rows.

Revision ID: 0020
Revises: 0019
Create Date: 2026-09-06

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0020"
down_revision: Union[str, None] = "0019"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "photo_tags",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("photo_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["photo_id"], ["photos.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("photo_id", "user_id", name="uq_photo_tags_photo_user"),
    )
    op.create_index("ix_photo_tags_photo_id", "photo_tags", ["photo_id"])
    op.create_index("ix_photo_tags_user_id", "photo_tags", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_photo_tags_user_id", table_name="photo_tags")
    op.drop_index("ix_photo_tags_photo_id", table_name="photo_tags")
    op.drop_table("photo_tags")
