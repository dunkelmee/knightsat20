from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


def _to_camel(snake: str) -> str:
    first, *rest = snake.split("_")
    return first + "".join(word.capitalize() for word in rest)


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True, from_attributes=True)


# ---------------------------------------------------------------------------
# Survey responses
# ---------------------------------------------------------------------------


class SurveyResponseCreate(CamelModel):
    # Identity (full_name/contact_number/email) is intentionally absent here —
    # it's populated server-side from the logged-in account, never re-entered
    # in the form (see routers/survey_responses.py).
    section2007: str | None = None

    attendance: str
    attendance_reason: str | None = None

    preferred_months: list[str] = Field(default_factory=list)
    specific_date_notes: str | None = None

    venue_suggestion: str | None = None
    preferred_venue_type: list[str] = Field(default_factory=list)
    venue_type_other: str | None = None

    pledge_option: str
    custom_pledge_amount: str | None = None
    other_sponsorships: list[str] = Field(default_factory=list)
    other_sponsorship_details: str | None = None

    skills_offered: list[str] = Field(default_factory=list)
    skills_details: str | None = None

    nominated_organizer: str | None = None
    willing_to_organize: str

    plus_ones_count: int | None = None
    kids_count: int | None = None
    bringing_plus_one: str | None = None
    bringing_kids: str | None = None

    other_suggestions: str | None = None


class SurveyResponseOut(SurveyResponseCreate):
    id: str
    submitted_at: datetime
    full_name: str
    contact_number: str
    email: str | None = None
    computed_pledge_amount: int
    pledge_paid_status: str | None = None
    admin_notes: str | None = None


class PaymentStatusUpdate(CamelModel):
    status: str


# ---------------------------------------------------------------------------
# RSVPs
# ---------------------------------------------------------------------------


class RSVPCreate(CamelModel):
    full_name: str
    contact_number: str | None = None
    email: str | None = None
    status: str
    bringing_plus_one: bool = False
    plus_ones_count: int = 0
    kids_count: int = 0
    dietary_restrictions: str | None = None
    message_to_batch: str | None = None


class RSVPOut(RSVPCreate):
    id: str
    submitted_at: datetime
    photo_url: str | None = None


class RSVPPublicOut(CamelModel):
    """PII-free subset served to unauthenticated visitors — no contactNumber/email."""

    id: str
    submitted_at: datetime
    full_name: str
    status: str
    bringing_plus_one: bool
    plus_ones_count: int
    kids_count: int
    message_to_batch: str | None = None
    photo_url: str | None = None


# ---------------------------------------------------------------------------
# Event-entrance QR check-in
# ---------------------------------------------------------------------------


class CheckInLookupOut(CamelModel):
    user_id: str
    full_name: str
    now_photo_url: str | None = None
    # Whether the attendee's survey response indicated a +1 — a hint for the
    # organizer at the door, not a guarantee of who actually shows up.
    expected_plus_one: bool | None = None
    checked_in: bool
    checked_in_at: datetime | None = None
    checked_in_plus_one: bool = False


class CheckInConfirmRequest(CamelModel):
    plus_one: bool = False


# ---------------------------------------------------------------------------
# Announcements
# ---------------------------------------------------------------------------


class AnnouncementCreate(CamelModel):
    title: str
    caption: str
    image_url: str | None = None
    tag: str
    author: str
    date: str
    is_pinned: bool = False


class AnnouncementOut(AnnouncementCreate):
    id: str
    likes_count: int
    # Whether the requesting user has liked this announcement — drives the
    # like button's toggle state (see routers/announcements.py).
    liked_by_me: bool = False


# ---------------------------------------------------------------------------
# Planned expenses
# ---------------------------------------------------------------------------


class PlannedExpenseCreate(CamelModel):
    name: str
    category: str
    amount: float
    target_date: str | None = None
    status: str
    notes: str | None = None


class PlannedExpenseOut(PlannedExpenseCreate):
    id: str
    updated_at: datetime


# ---------------------------------------------------------------------------
# Scouted venues (committee-internal, admin only)
# ---------------------------------------------------------------------------


class ScoutedVenueCreate(CamelModel):
    name: str
    tentative_date: str | None = None
    address: str | None = None
    quoted_cost: float | None = None
    misc_details: str | None = None


class ScoutedVenueOut(ScoutedVenueCreate):
    id: str
    updated_at: datetime


# ---------------------------------------------------------------------------
# Event details
# ---------------------------------------------------------------------------


class EventDetailsUpdate(CamelModel):
    status: str
    date: str
    time: str | None = None
    venue: str
    venue_address: str | None = None
    map_link: str | None = None
    dress_code: str | None = None
    theme: str | None = None
    notes: str | None = None


class EventDetailsOut(EventDetailsUpdate):
    updated_at: datetime | None = None


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------


class DashboardStatsOut(CamelModel):
    total_surveys: int
    total_pledges: int
    total_expenses: int
    running_balance: int
    attending_count: int
    likely_count: int
    undecided_count: int
    declined_count: int
    estimated_headcount: int
    pledging_count: int
    month_tally: dict[str, int]
    venue_tally: dict[str, int]


# ---------------------------------------------------------------------------
# Superadmin
# ---------------------------------------------------------------------------


class SuperadminLoginRequest(CamelModel):
    email: EmailStr
    password: str


class SuperadminSessionOut(CamelModel):
    is_superadmin: bool


class AdminUserOut(CamelModel):
    id: str
    full_name: str
    email: str
    created_at: datetime
    is_organizer: bool
    onboarding_completed: bool


class OrganizerUpdateRequest(CamelModel):
    is_organizer: bool


class SuperadminPasswordConfirm(CamelModel):
    """Step-up re-auth required for the most destructive superadmin actions
    (deleting a user) even though the session is already superadmin-gated."""

    password: str


class AuditLogOut(CamelModel):
    id: str
    actor_name: str
    description: str
    created_at: datetime


# ---------------------------------------------------------------------------
# User auth (email OTP)
# ---------------------------------------------------------------------------


class RegisterRequest(CamelModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=200)
    mobile_number: str = Field(min_length=1, max_length=50)
    invite_code: str = Field(min_length=1, max_length=100)


class LoginRequest(CamelModel):
    email: EmailStr


class VerifyOtpRequest(CamelModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class AuthMessageOut(CamelModel):
    message: str
    # True when the submitted email is the configured superadmin email — the
    # frontend swaps its OTP step for a password prompt instead; no OTP is
    # sent and no `users` row is touched in that case.
    requires_superadmin_password: bool = False
    # True when a login was attempted for an email with no account — the
    # frontend routes the user to the registration form instead of the OTP
    # screen. This app is a low-sensitivity batch reunion hub, so revealing
    # non-existence here is an accepted tradeoff in favor of onboarding UX.
    account_not_found: bool = False


class UserProfileOut(CamelModel):
    id: str
    email: str
    full_name: str
    mobile_number: str
    then_photo_url: str | None = None
    now_photo_url: str | None = None
    onboarding_completed: bool
    current_city: str | None = None
    current_role: str | None = None
    section_year1: str | None = None
    section_year2: str | None = None
    section_year3: str | None = None
    section_hs: str | None = None
    show_in_directory: bool = True
    is_organizer: bool = False


class AuthSessionOut(CamelModel):
    user: UserProfileOut | None = None
    has_submitted_survey: bool = False


class ProfileUpdateRequest(CamelModel):
    full_name: str = Field(min_length=1, max_length=200)
    mobile_number: str = Field(min_length=1, max_length=50)


# Then/Now photos are uploaded (and removed) via their own endpoint —
# POST/DELETE /api/auth/profile/photo — since the browser resizes them to a
# JPEG file before upload rather than inlining base64 into this payload.
class ProfilePhotoOut(CamelModel):
    url: str | None = None


# ---------------------------------------------------------------------------
# Directory
# ---------------------------------------------------------------------------


class DirectoryUpdateRequest(CamelModel):
    current_city: str | None = Field(default=None, max_length=200)
    current_role: str | None = Field(default=None, max_length=200)
    section_year1: str | None = Field(default=None, max_length=200)
    section_year2: str | None = Field(default=None, max_length=200)
    section_year3: str | None = Field(default=None, max_length=200)
    section_hs: str | None = Field(default=None, max_length=200)
    show_in_directory: bool = True


class DirectoryPersonOut(CamelModel):
    id: str
    display_name: str
    current_city: str | None = None
    current_role: str | None = None
    section_year1: str | None = None
    section_year2: str | None = None
    section_year3: str | None = None
    section_hs: str | None = None
    then_photo_url: str | None = None
    now_photo_url: str | None = None
    status: str  # "attending" | "missing" | "faculty"


class DirectoryCountsOut(CamelModel):
    all: int
    attending: int
    missing: int
    faculty: int


class DirectoryListOut(CamelModel):
    total: int
    counts: DirectoryCountsOut
    next_cursor: str | None = None
    people: list[DirectoryPersonOut]


# ---------------------------------------------------------------------------
# Photo Wall
# ---------------------------------------------------------------------------


class AlbumCreate(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


class AlbumUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    is_live_day: bool | None = None


class ContributorOut(CamelModel):
    initials: str
    full_name: str
    # "Now" profile photo, so album cards can stack real faces instead of initials.
    now_photo_url: str | None = None


class AlbumOut(CamelModel):
    id: str
    title: str
    description: str | None = None
    is_live_day: bool
    photo_count: int
    contributor_count: int
    cover_thumb_url: str | None = None
    recent_thumb_urls: list[str] = Field(default_factory=list)
    contributors: list[ContributorOut] = Field(default_factory=list)


class PersonRefOut(CamelModel):
    """A batchmate as shown in a tag chip or a lookup result."""

    id: str
    full_name: str
    initials: str
    now_photo_url: str | None = None


class PhotoOut(CamelModel):
    id: str
    thumb_url: str
    full_url: str
    caption: str | None = None
    uploader_initials: str
    uploaded_by: str
    created_at: datetime
    tags: list[PersonRefOut] = Field(default_factory=list)


class PhotoUpdate(CamelModel):
    """Caption/tag edit. Both fields are optional and only applied when the
    client actually sends them — `caption: null` clears the caption, whereas
    omitting it leaves the existing one alone (see routers/albums.py)."""

    caption: str | None = Field(default=None, max_length=300)
    tagged_user_ids: list[str] | None = Field(default=None, max_length=50)


class AlbumDetailOut(CamelModel):
    id: str
    title: str
    description: str | None = None
    is_live_day: bool
    created_by: str
    photo_count: int
    next_cursor: str | None = None
    photos: list[PhotoOut]
