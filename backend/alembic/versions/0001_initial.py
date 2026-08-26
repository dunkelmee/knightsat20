"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "survey_responses",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("contact_number", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("section2007", sa.String(), nullable=True),
        sa.Column("attendance", sa.String(), nullable=False),
        sa.Column("attendance_reason", sa.Text(), nullable=True),
        sa.Column("preferred_months", postgresql.JSONB(), nullable=False),
        sa.Column("specific_date_notes", sa.Text(), nullable=True),
        sa.Column("venue_suggestion", sa.String(), nullable=True),
        sa.Column("preferred_venue_type", sa.String(), nullable=False),
        sa.Column("venue_type_other", sa.String(), nullable=True),
        sa.Column("pledge_option", sa.String(), nullable=False),
        sa.Column("custom_pledge_amount", sa.String(), nullable=True),
        sa.Column("computed_pledge_amount", sa.Integer(), nullable=False),
        sa.Column("other_sponsorships", postgresql.JSONB(), nullable=False),
        sa.Column("other_sponsorship_details", sa.Text(), nullable=True),
        sa.Column("skills_offered", postgresql.JSONB(), nullable=False),
        sa.Column("skills_details", sa.Text(), nullable=True),
        sa.Column("nominated_organizer", sa.String(), nullable=True),
        sa.Column("willing_to_organize", sa.String(), nullable=False),
        sa.Column("plus_ones_count", sa.Integer(), nullable=True),
        sa.Column("kids_count", sa.Integer(), nullable=True),
        sa.Column("bringing_plus_one", sa.String(), nullable=True),
        sa.Column("bringing_kids", sa.String(), nullable=True),
        sa.Column("other_suggestions", sa.Text(), nullable=True),
        sa.Column("pledge_paid_status", sa.String(), nullable=True),
        sa.Column("admin_notes", sa.Text(), nullable=True),
    )
    op.create_index(
        "ix_survey_responses_contact_number", "survey_responses", ["contact_number"]
    )

    op.create_table(
        "rsvps",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("contact_number", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("bringing_plus_one", sa.Boolean(), nullable=False),
        sa.Column("kids_count", sa.Integer(), nullable=False),
        sa.Column("dietary_restrictions", sa.String(), nullable=True),
        sa.Column("message_to_batch", sa.Text(), nullable=True),
    )
    op.create_index("ix_rsvps_contact_number", "rsvps", ["contact_number"])

    op.create_table(
        "announcements",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("caption", sa.Text(), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("tag", sa.String(), nullable=False),
        sa.Column("author", sa.String(), nullable=False),
        sa.Column("date", sa.String(), nullable=False),
        sa.Column("is_pinned", sa.Boolean(), nullable=False),
        sa.Column("likes_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "planned_expenses",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("target_date", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "event_details",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("date", sa.String(), nullable=False),
        sa.Column("time", sa.String(), nullable=True),
        sa.Column("venue", sa.String(), nullable=False),
        sa.Column("venue_address", sa.String(), nullable=True),
        sa.Column("map_link", sa.String(), nullable=True),
        sa.Column("dress_code", sa.String(), nullable=True),
        sa.Column("theme", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("event_details")
    op.drop_table("planned_expenses")
    op.drop_table("announcements")
    op.drop_index("ix_rsvps_contact_number", table_name="rsvps")
    op.drop_table("rsvps")
    op.drop_index("ix_survey_responses_contact_number", table_name="survey_responses")
    op.drop_table("survey_responses")
