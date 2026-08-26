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
    full_name: str
    contact_number: str
    email: str | None = None
    section2007: str | None = None

    attendance: str
    attendance_reason: str | None = None

    preferred_months: list[str] = Field(default_factory=list)
    specific_date_notes: str | None = None

    venue_suggestion: str | None = None
    preferred_venue_type: str
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
    kids_count: int = 0
    dietary_restrictions: str | None = None
    message_to_batch: str | None = None


class RSVPOut(RSVPCreate):
    id: str
    submitted_at: datetime


class RSVPPublicOut(CamelModel):
    """PII-free subset served to unauthenticated visitors — no contactNumber/email."""

    id: str
    submitted_at: datetime
    full_name: str
    status: str
    bringing_plus_one: bool
    kids_count: int
    message_to_batch: str | None = None


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
# Admin auth
# ---------------------------------------------------------------------------


class AdminLoginRequest(CamelModel):
    passcode: str


class AdminSessionOut(CamelModel):
    is_admin: bool


# ---------------------------------------------------------------------------
# User auth (email OTP)
# ---------------------------------------------------------------------------


class RegisterRequest(CamelModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=200)
    mobile_number: str = Field(min_length=1, max_length=50)


class LoginRequest(CamelModel):
    email: EmailStr


class VerifyOtpRequest(CamelModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class AuthMessageOut(CamelModel):
    message: str


class UserProfileOut(CamelModel):
    id: str
    email: str
    full_name: str
    mobile_number: str


class AuthSessionOut(CamelModel):
    user: UserProfileOut | None = None
