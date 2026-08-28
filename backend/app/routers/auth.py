import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.config import get_settings
from app.database import get_db
from app.models import SurveyResponse, User
from app.otp import create_and_send_otp, verify_code
from app.schemas import (
    AuthMessageOut,
    AuthSessionOut,
    LoginRequest,
    ProfilePhotoOut,
    ProfileUpdateRequest,
    RegisterRequest,
    SuperadminLoginRequest,
    SuperadminSessionOut,
    UserProfileOut,
    VerifyOtpRequest,
)
from app.security import (
    SESSION_SUPERADMIN_KEY,
    SESSION_USER_ID_KEY,
    check_superadmin_password,
    get_current_user,
    is_superadmin,
)
from app.storage import delete_profile_photo, resolve_url, save_profile_photo

router = APIRouter(prefix="/api/auth", tags=["auth"])

_GENERIC_SENT_MESSAGE = "If that email has an account, we've sent a verification code."
_GENERIC_REGISTER_MESSAGE = "Check your email for a verification code to finish setting up your account."
_SUPERADMIN_PASSWORD_MESSAGE = "Enter the superadmin password."

# The browser resizes every "then"/"now" photo to a small JPEG before upload
# (see src/utils/imageResize.ts) — this just guards against a misbehaving
# client rather than being the primary size control.
_MAX_PROFILE_PHOTO_BYTES = 3 * 1024 * 1024


def _client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


def _is_superadmin_email(email: str) -> bool:
    settings = get_settings()
    if not settings.superadmin_email:
        return False
    return email.strip().lower() == settings.superadmin_email.strip().lower()


async def _get_user_by_email(db: AsyncSession, email: str) -> User | None:
    normalized = email.strip().lower()
    result = await db.execute(select(User).where(User.email == normalized))
    return result.scalars().first()


def _to_profile_out(user: User) -> UserProfileOut:
    return UserProfileOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        mobile_number=user.mobile_number,
        then_photo_url=user.then_photo_url,
        now_photo_url=user.now_photo_url,
        onboarding_completed=user.onboarding_completed_at is not None,
        current_city=user.current_city,
        current_role=user.current_role,
        section_hs=user.section_hs,
        show_in_directory=user.show_in_directory,
        is_organizer=user.is_organizer,
    )


async def _has_submitted_survey(db: AsyncSession, user_id: str) -> bool:
    count = (
        await db.execute(
            select(func.count()).select_from(SurveyResponse).where(SurveyResponse.user_id == user_id)
        )
    ).scalar_one()
    return count > 0


@router.post("/register", response_model=AuthMessageOut)
async def register(payload: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    if _is_superadmin_email(normalized_email):
        return AuthMessageOut(message=_SUPERADMIN_PASSWORD_MESSAGE, requires_superadmin_password=True)

    existing = await _get_user_by_email(db, normalized_email)

    if existing:
        # Don't reveal that the account already exists — just send them a
        # login code and return the same message as a fresh registration.
        await create_and_send_otp(db, existing, _client_ip(request))
        return AuthMessageOut(message=_GENERIC_REGISTER_MESSAGE)

    user = User(
        email=normalized_email,
        full_name=payload.full_name.strip(),
        mobile_number=payload.mobile_number.strip(),
    )
    db.add(user)
    await db.flush()
    record_action(db, f"{user.full_name} created an account", actor_name=user.full_name, actor_user_id=user.id)
    await db.commit()
    await db.refresh(user)

    await create_and_send_otp(db, user, _client_ip(request))
    return AuthMessageOut(message=_GENERIC_REGISTER_MESSAGE)


@router.post("/login", response_model=AuthMessageOut)
async def login(payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    if _is_superadmin_email(normalized_email):
        return AuthMessageOut(message=_SUPERADMIN_PASSWORD_MESSAGE, requires_superadmin_password=True)

    user = await _get_user_by_email(db, normalized_email)
    if user:
        await create_and_send_otp(db, user, _client_ip(request))
    # Identical response whether or not the account exists.
    return AuthMessageOut(message=_GENERIC_SENT_MESSAGE)


@router.post("/verify", response_model=AuthSessionOut)
async def verify(payload: VerifyOtpRequest, request: Request, db: AsyncSession = Depends(get_db)):
    user = await _get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect code.")

    await verify_code(db, user, payload.code)

    request.session[SESSION_USER_ID_KEY] = user.id
    record_action(db, f"{user.full_name} logged in", actor_name=user.full_name, actor_user_id=user.id)
    await db.commit()

    return AuthSessionOut(
        user=_to_profile_out(user), has_submitted_survey=await _has_submitted_survey(db, user.id)
    )


@router.post("/logout", response_model=AuthSessionOut)
async def logout(request: Request):
    request.session.pop(SESSION_USER_ID_KEY, None)
    request.session.pop(SESSION_SUPERADMIN_KEY, None)
    return AuthSessionOut(user=None)


@router.get("/session", response_model=AuthSessionOut)
async def session_status(request: Request, db: AsyncSession = Depends(get_db)):
    user_id = request.session.get(SESSION_USER_ID_KEY)
    if not user_id:
        return AuthSessionOut(user=None)
    user = await db.get(User, user_id)
    if not user:
        return AuthSessionOut(user=None)
    return AuthSessionOut(
        user=_to_profile_out(user), has_submitted_survey=await _has_submitted_survey(db, user.id)
    )


@router.put("/profile", response_model=AuthSessionOut)
async def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.full_name = payload.full_name.strip()
    current_user.mobile_number = payload.mobile_number.strip()
    if current_user.onboarding_completed_at is None:
        current_user.onboarding_completed_at = datetime.now(timezone.utc)
    record_action(
        db,
        f"{current_user.full_name} updated their profile",
        actor_name=current_user.full_name,
        actor_user_id=current_user.id,
    )
    await db.commit()
    await db.refresh(current_user)

    return AuthSessionOut(
        user=_to_profile_out(current_user),
        has_submitted_survey=await _has_submitted_survey(db, current_user.id),
    )


@router.post("/profile/photo", response_model=ProfilePhotoOut)
async def upload_profile_photo(
    slot: Literal["then", "now"] = Form(...),
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if photo.content_type != "image/jpeg":
        raise HTTPException(status_code=400, detail="Only JPEG uploads are accepted")

    image_bytes = await photo.read()
    if len(image_bytes) > _MAX_PROFILE_PHOTO_BYTES:
        raise HTTPException(status_code=400, detail="Photo is too large")

    old_key = current_user.then_photo_url if slot == "then" else current_user.now_photo_url
    key = save_profile_photo(current_user.id, str(uuid.uuid4()), image_bytes)
    if slot == "then":
        current_user.then_photo_url = key
    else:
        current_user.now_photo_url = key

    record_action(
        db, f"{current_user.full_name} updated their {slot} photo",
        actor_name=current_user.full_name, actor_user_id=current_user.id,
    )
    await db.commit()
    delete_profile_photo(old_key)

    return ProfilePhotoOut(url=resolve_url(key))


@router.delete("/profile/photo", status_code=204)
async def remove_profile_photo(
    slot: Literal["then", "now"] = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    old_key = current_user.then_photo_url if slot == "then" else current_user.now_photo_url
    if slot == "then":
        current_user.then_photo_url = None
    else:
        current_user.now_photo_url = None

    record_action(
        db, f"{current_user.full_name} removed their {slot} photo",
        actor_name=current_user.full_name, actor_user_id=current_user.id,
    )
    await db.commit()
    delete_profile_photo(old_key)


# ---------------------------------------------------------------------------
# Superadmin — a single, env-configured identity, not a `users` row. Reached
# via the same login form: submitting the superadmin email above short-
# circuits to `requires_superadmin_password`, and the frontend swaps in the
# password form that posts here.
# ---------------------------------------------------------------------------


@router.post("/superadmin-login", response_model=SuperadminSessionOut)
async def superadmin_login(payload: SuperadminLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if not _is_superadmin_email(payload.email) or not check_superadmin_password(payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")

    request.session[SESSION_SUPERADMIN_KEY] = True
    record_action(db, "Superadmin logged in", actor_name="Superadmin")
    await db.commit()
    return SuperadminSessionOut(is_superadmin=True)


@router.get("/superadmin-session", response_model=SuperadminSessionOut)
async def superadmin_session_status(request: Request):
    return SuperadminSessionOut(is_superadmin=is_superadmin(request))
