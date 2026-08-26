import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.email import send_otp_email
from app.models import OtpCode, User

OTP_LENGTH = 6
OTP_TTL_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_COOLDOWN_SECONDS = 60
OTP_MAX_PER_USER_PER_HOUR = 5
OTP_MAX_PER_IP_PER_HOUR = 20


def _now() -> datetime:
    return datetime.now(timezone.utc)


def generate_code() -> str:
    return "".join(str(secrets.randbelow(10)) for _ in range(OTP_LENGTH))


def hash_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


async def create_and_send_otp(db: AsyncSession, user: User, requested_ip: str | None) -> None:
    """Enforces resend cooldown + hourly issuance caps, then stores and emails a new code."""
    one_hour_ago = _now() - timedelta(hours=1)

    latest = (
        await db.execute(
            select(OtpCode)
            .where(OtpCode.user_id == user.id)
            .order_by(OtpCode.created_at.desc())
            .limit(1)
        )
    ).scalars().first()

    if latest and latest.created_at > _now() - timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS):
        wait = OTP_RESEND_COOLDOWN_SECONDS - int((_now() - latest.created_at).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {max(wait, 1)}s before requesting another code.",
            headers={"Retry-After": str(max(wait, 1))},
        )

    per_user_count = (
        await db.execute(
            select(func.count())
            .select_from(OtpCode)
            .where(OtpCode.user_id == user.id, OtpCode.created_at > one_hour_ago)
        )
    ).scalar_one()
    if per_user_count >= OTP_MAX_PER_USER_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many codes requested for this account. Please try again later.",
        )

    if requested_ip:
        per_ip_count = (
            await db.execute(
                select(func.count())
                .select_from(OtpCode)
                .where(OtpCode.requested_ip == requested_ip, OtpCode.created_at > one_hour_ago)
            )
        ).scalar_one()
        if per_ip_count >= OTP_MAX_PER_IP_PER_HOUR:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many codes requested from this network. Please try again later.",
            )

    code = generate_code()
    db.add(
        OtpCode(
            user_id=user.id,
            code_hash=hash_code(code),
            expires_at=_now() + timedelta(minutes=OTP_TTL_MINUTES),
            requested_ip=requested_ip,
        )
    )
    await db.commit()

    await send_otp_email(user.email, user.full_name, code)


async def verify_code(db: AsyncSession, user: User, code: str) -> bool:
    """Returns True and consumes the OTP on success. Raises HTTPException on failure."""
    otp = (
        await db.execute(
            select(OtpCode)
            .where(OtpCode.user_id == user.id, OtpCode.consumed_at.is_(None))
            .order_by(OtpCode.created_at.desc())
            .limit(1)
        )
    ).scalars().first()

    if not otp or otp.expires_at < _now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="That code has expired. Please request a new one.",
        )

    if otp.attempt_count >= OTP_MAX_ATTEMPTS:
        otp.consumed_at = _now()
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many incorrect attempts. Please request a new code.",
        )

    if not secrets.compare_digest(hash_code(code), otp.code_hash):
        otp.attempt_count += 1
        await db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect code.")

    otp.consumed_at = _now()
    await db.commit()
    return True
