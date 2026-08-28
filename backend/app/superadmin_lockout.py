import logging
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import SuperadminLoginAttempt

logger = logging.getLogger("knightsat.security")

LOCKOUT_WINDOW_MINUTES = 15
MAX_FAILED_ATTEMPTS_PER_IP = 5


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def check_not_locked_out(db: AsyncSession, ip: str | None) -> None:
    """Raises 429 if this IP has too many recent failed superadmin logins.

    Windowed per-IP rather than a single global counter, so a distributed
    attacker still needs many source IPs to keep guessing, but one attacker
    spamming failures can't lock the real superadmin out of their own login.
    """
    if not ip:
        return
    window_start = _now() - timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
    count = (
        await db.execute(
            select(func.count())
            .select_from(SuperadminLoginAttempt)
            .where(SuperadminLoginAttempt.ip == ip, SuperadminLoginAttempt.created_at > window_start)
        )
    ).scalar_one()
    if count >= MAX_FAILED_ATTEMPTS_PER_IP:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please try again later.",
            headers={"Retry-After": str(LOCKOUT_WINDOW_MINUTES * 60)},
        )


async def record_failed_attempt(db: AsyncSession, ip: str | None, attempted_email: str) -> None:
    db.add(SuperadminLoginAttempt(ip=ip))
    await db.commit()
    logger.warning("Failed superadmin login attempt from ip=%s email=%s", ip, attempted_email)
