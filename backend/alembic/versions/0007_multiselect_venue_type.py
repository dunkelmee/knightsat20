"""preferred_venue_type becomes multiselect (string -> jsonb list)

Revision ID: 0007
Revises: 0006
Create Date: 2026-08-27

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE survey_responses "
        "ALTER COLUMN preferred_venue_type TYPE jsonb "
        "USING to_jsonb(ARRAY[preferred_venue_type])"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE survey_responses "
        "ALTER COLUMN preferred_venue_type TYPE varchar "
        "USING (preferred_venue_type->>0)"
    )
