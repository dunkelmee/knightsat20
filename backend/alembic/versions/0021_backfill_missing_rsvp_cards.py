"""give every survey respondent an attendance-wall card

Cards were only ever *created* for people who answered "yes" / "most likely" —
_RSVP_STATUS_BY_ATTENDANCE mapped all four answers, but the create branch was
gated on an attending-only set, so a first-time "Not sure yet" (and "can't
join") produced no row at all. Those people were missing from the wall
entirely, and editing their answer to a yes later did not help either, since
the update branch needs a card that was never written.

The gate is gone in app/routers/survey_responses.py; this backfills the rows it
should have written. Matching mirrors _sync_rsvp_from_survey: contact number,
else case-insensitive full name.

Revision ID: 0021
Revises: 0020
Create Date: 2026-09-07

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0021"
down_revision: Union[str, None] = "0020"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# One row per person, newest answer wins — survey_responses is unique per
# account, but pre-account rows can share a name, and the router collapses
# those onto a single card too.
_MISSING = """
    SELECT DISTINCT ON (LOWER(sr.full_name))
           sr.user_id,
           sr.full_name,
           sr.contact_number,
           sr.email,
           CASE sr.attendance
             WHEN 'Yes, definitely!' THEN 'Attending'
             WHEN 'Most likely, but still confirming' THEN 'Most likely'
             WHEN 'Not sure yet' THEN 'Maybe'
             WHEN 'Unfortunately, I won’t be able to attend' THEN 'Decline'
           END AS status,
           -- Mirrors companions.plus_one_count: the count is authoritative,
           -- the display string is the fallback for pre-count responses.
           GREATEST(COALESCE(
             sr.plus_ones_count,
             CASE WHEN sr.bringing_plus_one LIKE 'Yes%' THEN 1 ELSE 0 END
           ), 0) AS plus_ones,
           CASE WHEN sr.bringing_kids = 'Yes' AND sr.kids_count IS NOT NULL
                THEN GREATEST(sr.kids_count, 0) ELSE 0 END AS kids,
           NULLIF(sr.other_suggestions, '') AS message,
           sr.submitted_at
      FROM survey_responses sr
     WHERE sr.attendance IN (
             'Yes, definitely!',
             'Most likely, but still confirming',
             'Not sure yet',
             'Unfortunately, I won’t be able to attend'
           )
       AND NOT EXISTS (
             SELECT 1 FROM rsvps r
              WHERE (sr.contact_number IS NOT NULL
                     AND sr.contact_number = r.contact_number)
                 OR LOWER(sr.full_name) = LOWER(r.full_name)
           )
     ORDER BY LOWER(sr.full_name), sr.submitted_at DESC
"""


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO rsvps (
            id, submitted_at, user_id, full_name, contact_number, email,
            status, bringing_plus_one, plus_ones_count, kids_count,
            dietary_restrictions, message_to_batch
        )
        SELECT gen_random_uuid()::text, m.submitted_at, m.user_id, m.full_name,
               m.contact_number, m.email, m.status,
               m.plus_ones > 0, m.plus_ones, m.kids, NULL, m.message
          FROM (""" + _MISSING + """) m
        """
    )


def downgrade() -> None:
    # Undoing this would mean guessing which cards predate the backfill, and
    # dropping a real card loses someone's message to the batch. Cards created
    # here are harmless to keep, so this is deliberately a no-op.
    pass
