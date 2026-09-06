"""link rsvps to the account behind them, for attendance-wall avatars

Cards were only ever matched to people by contact number / name. The wall now
shows each person's profile photo, which needs a real link to users; backfill
it from the matching survey response, then from a matching account for cards
that never came from a survey.

Revision ID: 0017
Revises: 0016
Create Date: 2026-09-05

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0017"
down_revision: Union[str, None] = "0016"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_FROM_SURVEY = """
UPDATE rsvps SET user_id = (
    SELECT sr.user_id
      FROM survey_responses sr
     WHERE sr.user_id IS NOT NULL
       AND ((sr.contact_number IS NOT NULL
             AND sr.contact_number = rsvps.contact_number)
            OR LOWER(sr.full_name) = LOWER(rsvps.full_name))
     ORDER BY sr.submitted_at DESC
     LIMIT 1
)
"""

_FROM_USERS = """
UPDATE rsvps SET user_id = (
    SELECT u.id
      FROM users u
     WHERE (u.mobile_number IS NOT NULL
            AND u.mobile_number = rsvps.contact_number)
        OR LOWER(u.full_name) = LOWER(rsvps.full_name)
     ORDER BY u.id
     LIMIT 1
)
WHERE user_id IS NULL
"""


def upgrade() -> None:
    op.add_column("rsvps", sa.Column("user_id", sa.String(), nullable=True))
    op.create_foreign_key(
        "fk_rsvps_user_id", "rsvps", "users", ["user_id"], ["id"], ondelete="SET NULL"
    )
    op.create_index("ix_rsvps_user_id", "rsvps", ["user_id"])
    op.execute(_FROM_SURVEY)
    op.execute(_FROM_USERS)


def downgrade() -> None:
    op.drop_index("ix_rsvps_user_id", table_name="rsvps")
    op.drop_constraint("fk_rsvps_user_id", "rsvps", type_="foreignkey")
    op.drop_column("rsvps", "user_id")
