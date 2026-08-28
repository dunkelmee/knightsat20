"""drop users.is_demo (reset-demo-data feature removed)

Revision ID: 0011
Revises: 0010
Create Date: 2026-08-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("users", "is_demo")


def downgrade() -> None:
    op.add_column(
        "users", sa.Column("is_demo", sa.Boolean(), nullable=False, server_default=sa.false())
    )
