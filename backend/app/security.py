import secrets

from fastapi import HTTPException, Request, status

from app.config import get_settings

SESSION_ADMIN_KEY = "is_admin"


def check_passcode(passcode: str) -> bool:
    settings = get_settings()
    return secrets.compare_digest(passcode, settings.admin_password)


def is_admin(request: Request) -> bool:
    return bool(request.session.get(SESSION_ADMIN_KEY))


def require_admin(request: Request) -> None:
    if not is_admin(request):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin login required")
