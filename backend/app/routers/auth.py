from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.otp import create_and_send_otp, verify_code
from app.schemas import (
    AuthMessageOut,
    AuthSessionOut,
    LoginRequest,
    RegisterRequest,
    UserProfileOut,
    VerifyOtpRequest,
)
from app.security import SESSION_ADMIN_KEY, SESSION_USER_ID_KEY, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

_GENERIC_SENT_MESSAGE = "If that email has an account, we've sent a verification code."
_GENERIC_REGISTER_MESSAGE = "Check your email for a verification code to finish setting up your account."


def _client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


async def _get_user_by_email(db: AsyncSession, email: str) -> User | None:
    normalized = email.strip().lower()
    result = await db.execute(select(User).where(User.email == normalized))
    return result.scalars().first()


@router.post("/register", response_model=AuthMessageOut)
async def register(payload: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
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
    await db.commit()
    await db.refresh(user)

    await create_and_send_otp(db, user, _client_ip(request))
    return AuthMessageOut(message=_GENERIC_REGISTER_MESSAGE)


@router.post("/login", response_model=AuthMessageOut)
async def login(payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    user = await _get_user_by_email(db, payload.email)
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
    return AuthSessionOut(user=UserProfileOut.model_validate(user))


@router.post("/logout", response_model=AuthSessionOut)
async def logout(request: Request):
    request.session.pop(SESSION_USER_ID_KEY, None)
    request.session.pop(SESSION_ADMIN_KEY, None)
    return AuthSessionOut(user=None)


@router.get("/session", response_model=AuthSessionOut)
async def session_status(request: Request, db: AsyncSession = Depends(get_db)):
    user_id = request.session.get(SESSION_USER_ID_KEY)
    if not user_id:
        return AuthSessionOut(user=None)
    user = await db.get(User, user_id)
    if not user:
        return AuthSessionOut(user=None)
    return AuthSessionOut(user=UserProfileOut.model_validate(user))
