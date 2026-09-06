"""restore attendance-card messages that were clipped at 100 characters

The card's message was written as ``other_suggestions[:100]``, so anyone whose
note ran longer lost the tail mid-sentence. The full text was always kept on
the survey response, so re-derive it here; ``_sync_rsvp_from_survey`` no longer
truncates on write.

Only rows still holding the exact 100-character prefix are touched, so a
message an organizer edited by hand is left alone.

Revision ID: 0018
Revises: 0017
Create Date: 2026-09-05

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0018"
down_revision: Union[str, None] = "0017"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Same person-matching rule as revisions 0015-0017.
_RESTORE = """
UPDATE rsvps SET message_to_batch = latest.other_suggestions
FROM (
    SELECT r.id AS rsvp_id, sr.other_suggestions
      FROM rsvps r
      JOIN LATERAL (
        SELECT sr.other_suggestions
          FROM survey_responses sr
         WHERE (sr.contact_number IS NOT NULL
                AND sr.contact_number = r.contact_number)
            OR LOWER(sr.full_name) = LOWER(r.full_name)
         ORDER BY sr.submitted_at DESC
         LIMIT 1
      ) sr ON TRUE
) latest
WHERE rsvps.id = latest.rsvp_id
  AND latest.other_suggestions IS NOT NULL
  AND length(latest.other_suggestions) > 100
  AND rsvps.message_to_batch = left(latest.other_suggestions, 100)
"""


def upgrade() -> None:
    op.execute(_RESTORE)


def downgrade() -> None:
    op.execute(
        "UPDATE rsvps SET message_to_batch = left(message_to_batch, 100) "
        "WHERE message_to_batch IS NOT NULL AND length(message_to_batch) > 100"
    )
