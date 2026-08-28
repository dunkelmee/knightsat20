"""enforce one survey response per user

Revision ID: 0008
Revises: 0007
Create Date: 2026-08-28

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Prior to this migration, submitting the survey again created a new row
    # instead of updating the existing one. Keep only the most recent
    # response per user (rows with no user_id are untouched) before the
    # column can be made unique.
    op.execute(
        """
        DELETE FROM survey_responses sr
        USING survey_responses newer
        WHERE sr.user_id IS NOT NULL
          AND sr.user_id = newer.user_id
          AND (
            newer.submitted_at > sr.submitted_at
            OR (newer.submitted_at = sr.submitted_at AND newer.id > sr.id)
          )
        """
    )
    op.drop_index("ix_survey_responses_user_id", table_name="survey_responses")
    op.create_index(
        "ix_survey_responses_user_id", "survey_responses", ["user_id"], unique=True
    )


def downgrade() -> None:
    op.drop_index("ix_survey_responses_user_id", table_name="survey_responses")
    op.create_index(
        "ix_survey_responses_user_id", "survey_responses", ["user_id"], unique=False
    )
