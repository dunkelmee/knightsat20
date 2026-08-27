import secrets
from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models import User

SESSION_USER_ID_KEY = "user_id"
SESSION_SUPERADMIN_KEY = "is_superadmin"


def check_superadmin_password(password: str) -> bool:
    settings = get_settings()
    return secrets.compare_digest(password, settings.superadmin_password)


def is_superadmin(request: Request) -> bool:
    return bool(request.session.get(SESSION_SUPERADMIN_KEY))


def require_superadmin(request: Request) -> None:
    if not is_superadmin(request):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Superadmin login required")


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    user_id = request.session.get(SESSION_USER_ID_KEY)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")
    user = await db.get(User, user_id)
    if not user:
        # The account behind this session no longer exists — drop the stale session.
        request.session.pop(SESSION_USER_ID_KEY, None)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")
    return user


def is_organizer_or_superadmin(request: Request, user: User) -> bool:
    """For call sites that already have a loaded User (e.g. creator/uploader-or-organizer checks)."""
    return user.is_organizer or is_superadmin(request)


@dataclass
class Actor:
    """Who performed an organizer-gated action — an alumnus with is_organizer, or the superadmin
    (who has no `users` row). Used both to gate the route and to attribute the audit-log entry."""

    name: str
    user_id: str | None


async def get_organizer_actor(request: Request, db: AsyncSession = Depends(get_db)) -> Actor:
    if is_superadmin(request):
        return Actor(name="Superadmin", user_id=None)

    user_id = request.session.get(SESSION_USER_ID_KEY)
    if user_id:
        user = await db.get(User, user_id)
        if user and user.is_organizer:
            return Actor(name=user.full_name, user_id=user.id)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Organizer access required")
