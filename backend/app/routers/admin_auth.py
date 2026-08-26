from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import AdminLoginRequest, AdminSessionOut
from app.security import SESSION_ADMIN_KEY, check_passcode, is_admin, require_admin
from app.seed import reset_demo_data

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/login", response_model=AdminSessionOut)
async def login(payload: AdminLoginRequest, request: Request):
    if not check_passcode(payload.passcode):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect passcode")
    request.session[SESSION_ADMIN_KEY] = True
    return AdminSessionOut(is_admin=True)


@router.post("/logout", response_model=AdminSessionOut)
async def logout(request: Request):
    request.session.pop(SESSION_ADMIN_KEY, None)
    return AdminSessionOut(is_admin=False)


@router.get("/session", response_model=AdminSessionOut)
async def session_status(request: Request):
    return AdminSessionOut(is_admin=is_admin(request))


@router.post("/reset-demo-data", status_code=204, dependencies=[Depends(require_admin)])
async def reset_demo(db: AsyncSession = Depends(get_db)):
    await reset_demo_data(db)
