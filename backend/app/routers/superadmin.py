from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import AuditLog, User
from app.schemas import AdminUserOut, AuditLogOut, OrganizerUpdateRequest
from app.security import require_superadmin
from app.seed import reset_demo_data

router = APIRouter(prefix="/api/superadmin", tags=["superadmin"], dependencies=[Depends(require_superadmin)])


@router.get("/users", response_model=list[AdminUserOut])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return [
        AdminUserOut(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            created_at=user.created_at,
            is_organizer=user.is_organizer,
            onboarding_completed=user.onboarding_completed_at is not None,
        )
        for user in result.scalars().all()
    ]


@router.patch("/users/{user_id}/organizer", response_model=AdminUserOut)
async def update_organizer_status(
    user_id: str, payload: OrganizerUpdateRequest, db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_organizer = payload.is_organizer
    verb = "granted" if payload.is_organizer else "revoked"
    record_action(db, f"Superadmin {verb} organizer access for {user.full_name}", actor_name="Superadmin")
    await db.commit()
    await db.refresh(user)

    return AdminUserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        created_at=user.created_at,
        is_organizer=user.is_organizer,
        onboarding_completed=user.onboarding_completed_at is not None,
    )


@router.get("/audit-logs", response_model=list[AuditLogOut])
async def list_audit_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(200))
    return result.scalars().all()


@router.post("/reset-demo-data", status_code=204)
async def reset_demo(db: AsyncSession = Depends(get_db)):
    await reset_demo_data(db)
    record_action(db, "Superadmin reset the app to demo data", actor_name="Superadmin")
    await db.commit()
