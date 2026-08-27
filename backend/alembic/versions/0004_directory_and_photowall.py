"""directory profile fields + albums/photos tables

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("current_city", sa.String(), nullable=True))
    op.add_column("users", sa.Column("current_role", sa.String(), nullable=True))
    op.add_column("users", sa.Column("section_hs", sa.String(), nullable=True))
    op.add_column(
        "users",
        sa.Column("show_in_directory", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "users", sa.Column("is_faculty", sa.Boolean(), nullable=False, server_default=sa.false())
    )
    op.add_column(
        "users", sa.Column("is_demo", sa.Boolean(), nullable=False, server_default=sa.false())
    )

    op.create_table(
        "albums",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("is_live_day", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "photos",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column(
            "album_id",
            sa.String(),
            sa.ForeignKey("albums.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("uploaded_by", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("storage_key", sa.Text(), nullable=False),
        sa.Column("thumb_key", sa.Text(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_photos_album_id", "photos", ["album_id"])


def downgrade() -> None:
    op.drop_index("ix_photos_album_id", table_name="photos")
    op.drop_table("photos")
    op.drop_table("albums")

    op.drop_column("users", "is_demo")
    op.drop_column("users", "is_faculty")
    op.drop_column("users", "show_in_directory")
    op.drop_column("users", "section_hs")
    op.drop_column("users", "current_role")
    op.drop_column("users", "current_city")
