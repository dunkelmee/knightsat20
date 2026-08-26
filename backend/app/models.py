import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    full_name: Mapped[str] = mapped_column(String, nullable=False)
    contact_number: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    section2007: Mapped[str | None] = mapped_column(String, nullable=True)

    attendance: Mapped[str] = mapped_column(String, nullable=False)
    attendance_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    preferred_months: Mapped[list[str]] = mapped_column(JSONB, default=list)
    specific_date_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    venue_suggestion: Mapped[str | None] = mapped_column(String, nullable=True)
    preferred_venue_type: Mapped[str] = mapped_column(String, nullable=False)
    venue_type_other: Mapped[str | None] = mapped_column(String, nullable=True)

    pledge_option: Mapped[str] = mapped_column(String, nullable=False)
    custom_pledge_amount: Mapped[str | None] = mapped_column(String, nullable=True)
    computed_pledge_amount: Mapped[int] = mapped_column(Integer, default=0)
    other_sponsorships: Mapped[list[str]] = mapped_column(JSONB, default=list)
    other_sponsorship_details: Mapped[str | None] = mapped_column(Text, nullable=True)

    skills_offered: Mapped[list[str]] = mapped_column(JSONB, default=list)
    skills_details: Mapped[str | None] = mapped_column(Text, nullable=True)

    nominated_organizer: Mapped[str | None] = mapped_column(String, nullable=True)
    willing_to_organize: Mapped[str] = mapped_column(String, nullable=False)

    plus_ones_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    kids_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bringing_plus_one: Mapped[str | None] = mapped_column(String, nullable=True)
    bringing_kids: Mapped[str | None] = mapped_column(String, nullable=True)

    other_suggestions: Mapped[str | None] = mapped_column(Text, nullable=True)

    pledge_paid_status: Mapped[str | None] = mapped_column(
        String, default="Unpaid / Pledged"
    )
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class RSVPRecord(Base):
    __tablename__ = "rsvps"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    full_name: Mapped[str] = mapped_column(String, nullable=False)
    contact_number: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)

    status: Mapped[str] = mapped_column(String, nullable=False)
    bringing_plus_one: Mapped[bool] = mapped_column(Boolean, default=False)
    kids_count: Mapped[int] = mapped_column(Integer, default=0)
    dietary_restrictions: Mapped[str | None] = mapped_column(String, nullable=True)
    message_to_batch: Mapped[str | None] = mapped_column(Text, nullable=True)


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String, nullable=False)
    caption: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    tag: Mapped[str] = mapped_column(String, nullable=False)
    author: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    # Not exposed to clients — used only to order the feed newest-first,
    # since `date` is a free-text display string ("August 24, 2026").
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class PlannedExpense(Base):
    __tablename__ = "planned_expenses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    target_date: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class EventDetails(Base):
    """Singleton table — always exactly one row, id fixed to SINGLETON_ID."""

    __tablename__ = "event_details"

    SINGLETON_ID = "singleton"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: EventDetails.SINGLETON_ID)
    status: Mapped[str] = mapped_column(String, default="Pending")
    date: Mapped[str] = mapped_column(String, default="Pending / For finalization")
    time: Mapped[str | None] = mapped_column(String, nullable=True)
    venue: Mapped[str] = mapped_column(String, default="Pending / For finalization")
    venue_address: Mapped[str | None] = mapped_column(String, nullable=True)
    map_link: Mapped[str | None] = mapped_column(String, nullable=True)
    dress_code: Mapped[str | None] = mapped_column(String, nullable=True)
    theme: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
