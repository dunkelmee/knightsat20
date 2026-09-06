"""re-derive rsvps.status from each person's current survey answer

Cards used to be written only when someone answered "yes"/"most likely", so
editing the survey afterwards left a stale status on the attendance wall, and
"Most likely" was previously collapsed into "Maybe". Backfill both here; new
submissions stay in sync via _sync_rsvp_from_survey.

Revision ID: 0015
Revises: 0014
Create Date: 2026-09-05

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0015"
down_revision: Union[str, None] = "0014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Matches _RSVP_STATUS_BY_ATTENDANCE in app/routers/survey_responses.py.
_MATCH = """
    survey_responses sr
    WHERE (sr.contact_number IS NOT NULL
           AND sr.contact_number = rsvps.contact_number)
       OR LOWER(sr.full_name) = LOWER(rsvps.full_name)
"""

_LATEST_STATUS = """
    SELECT CASE sr.attendance
             WHEN 'Yes, definitely!' THEN 'Attending'
             WHEN 'Most likely, but still confirming' THEN 'Most likely'
             WHEN 'Not sure yet' THEN 'Maybe'
             WHEN 'Unfortunately, I won’t be able to attend' THEN 'Decline'
             ELSE rsvps.status
           END
    FROM """ + _MATCH + """
    ORDER BY sr.submitted_at DESC
    LIMIT 1
"""


def upgrade() -> None:
    op.execute(
        "UPDATE rsvps SET status = (" + _LATEST_STATUS + ") "
        "WHERE EXISTS (SELECT 1 FROM " + _MATCH + ")"
    )


def downgrade() -> None:
    # "Most likely" did not exist before this revision; fold it back into
    # "Maybe". The pre-backfill (stale) statuses are not recoverable.
    op.execute("UPDATE rsvps SET status = 'Maybe' WHERE status = 'Most likely'")
