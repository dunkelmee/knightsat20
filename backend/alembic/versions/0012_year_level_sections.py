"""add per-year-level homeroom section columns (1st-3rd year)

Revision ID: 0012
Revises: 0011
Create Date: 2026-09-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0012"
down_revision: Union[str, None] = "0011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("section_year1", sa.String(), nullable=True))
    op.add_column("users", sa.Column("section_year2", sa.String(), nullable=True))
    op.add_column("users", sa.Column("section_year3", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "section_year3")
    op.drop_column("users", "section_year2")
    op.drop_column("users", "section_year1")
