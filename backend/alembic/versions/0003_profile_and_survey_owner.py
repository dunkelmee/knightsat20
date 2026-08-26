"""profile fields (then/now photos, onboarding) and survey_responses.user_id

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("then_photo_url", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("now_photo_url", sa.Text(), nullable=True))
    op.add_column(
        "users", sa.Column("onboarding_completed_at", sa.DateTime(timezone=True), nullable=True)
    )

    op.add_column("survey_responses", sa.Column("user_id", sa.String(), nullable=True))
    op.create_foreign_key(
        "fk_survey_responses_user_id", "survey_responses", "users", ["user_id"], ["id"]
    )
    op.create_index(
        "ix_survey_responses_user_id", "survey_responses", ["user_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_survey_responses_user_id", table_name="survey_responses")
    op.drop_constraint("fk_survey_responses_user_id", "survey_responses", type_="foreignkey")
    op.drop_column("survey_responses", "user_id")

    op.drop_column("users", "onboarding_completed_at")
    op.drop_column("users", "now_photo_url")
    op.drop_column("users", "then_photo_url")
