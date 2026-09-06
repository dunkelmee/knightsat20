"""carry the adult-guest count onto rsvps, not just a yes/no flag

The attendance wall and the hero headcount read the RSVP row, which only had a
boolean — so a survey answer of "3 adult guests" was counted as one. Add the
count and backfill it from each person's survey response (falling back to the
old boolean for cards with no matching survey).

Revision ID: 0016
Revises: 0015
Create Date: 2026-09-05

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0016"
down_revision: Union[str, None] = "0015"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Same person-matching rule as revision 0015.
_BACKFILL = """
UPDATE rsvps SET plus_ones_count = COALESCE(
    (SELECT sr.plus_ones_count
       FROM survey_responses sr
      WHERE (sr.contact_number IS NOT NULL
             AND sr.contact_number = rsvps.contact_number)
         OR LOWER(sr.full_name) = LOWER(rsvps.full_name)
      ORDER BY sr.submitted_at DESC
      LIMIT 1),
    CASE WHEN rsvps.bringing_plus_one THEN 1 ELSE 0 END
)
"""


def upgrade() -> None:
    op.add_column(
        "rsvps",
        sa.Column("plus_ones_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.execute(_BACKFILL)


def downgrade() -> None:
    op.drop_column("rsvps", "plus_ones_count")
