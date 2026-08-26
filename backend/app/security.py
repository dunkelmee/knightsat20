import secrets

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models import User

SESSION_ADMIN_KEY = "is_admin"
SESSION_USER_ID_KEY = "user_id"


def check_passcode(passcode: str) -> bool:
    settings = get_settings()
    return secrets.compare_digest(passcode, settings.admin_password)


def is_admin(request: Request) -> bool:
    return bool(request.session.get(SESSION_ADMIN_KEY))


def require_admin(request: Request) -> None:
    if not is_admin(request):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin login required")


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    user_id = request.session.get(SESSION_USER_ID_KEY)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")
    user = await db.get(User, user_id)
    if not user:
        # The account behind this session no longer exists — drop the stale session.
        request.session.pop(SESSION_USER_ID_KEY, None)
        request.session.pop(SESSION_ADMIN_KEY, None)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")
    return user
