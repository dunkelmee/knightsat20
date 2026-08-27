import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    mobile_number: Mapped[str] = mapped_column(String, nullable=False)
    then_photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    now_photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Set once the one-time post-registration profile step (name/mobile
    # confirmation + Then & Now photos) is completed; gates entry to the app.
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    # --- Directory fields (alumni-editable via Edit Profile) ---
    current_city: Mapped[str | None] = mapped_column(String, nullable=True)
    current_role: Mapped[str | None] = mapped_column(String, nullable=True)
    section_hs: Mapped[str | None] = mapped_column(String, nullable=True)
    show_in_directory: Mapped[bool] = mapped_column(Boolean, default=True)
    is_faculty: Mapped[bool] = mapped_column(Boolean, default=False)

    # Marks fixture rows created by "Reset Demo Data" so a reset can safely
    # wipe/recreate them without ever touching real registered accounts.
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)

    # Permanent, per-account organizer access — granted/revoked only by the
    # superadmin (see routers/superadmin.py). Replaces the old shared
    # passcode: every new account starts as a plain attendee.
    is_organizer: Mapped[bool] = mapped_column(Boolean, default=False)


class AuditLog(Base):
    """Human-readable action log, viewable only by the superadmin."""

    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    actor_name: Mapped[str] = mapped_column(String, nullable=False)
    # Null when the actor is the superadmin (not a `users` row).
    actor_user_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)


class OtpCode(Base):
    __tablename__ = "otp_codes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    code_hash: Mapped[str] = mapped_column(String, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    requested_ip: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    # Nullable so historical/demo-seeded rows without an account still work;
    # real submissions always set this (see routers/survey_responses.py).
    user_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id"), nullable=True, index=True
    )

    # Denormalized snapshot of the submitter's identity at submission time —
    # populated server-side from the logged-in account, never client-input.
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


class Album(Base):
    __tablename__ = "albums"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    # Flags the single "Reunion Day" album surfaced first with a live badge.
    is_live_day: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    album_id: Mapped[str] = mapped_column(
        String, ForeignKey("albums.id", ondelete="CASCADE"), nullable=False, index=True
    )
    uploaded_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    # A local relative path (served from /uploads) or, for demo fixtures, a
    # full external URL — see app/storage.py::resolve_url.
    storage_key: Mapped[str] = mapped_column(Text, nullable=False)
    thumb_key: Mapped[str] = mapped_column(Text, nullable=False)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class ScoutedVenue(Base):
    """Committee-internal venue shortlist — never exposed to attendees."""

    __tablename__ = "scouted_venues"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    tentative_date: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    quoted_cost: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    misc_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
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
