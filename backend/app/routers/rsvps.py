from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import RSVPRecord, User
from app.schemas import RSVPCreate, RSVPOut, RSVPPublicOut
from app.security import get_current_user, get_organizer_actor

router = APIRouter(prefix="/api/rsvps", tags=["rsvps"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=RSVPOut)
async def create_or_update_rsvp(
    payload: RSVPCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = None
    if payload.contact_number:
        result = await db.execute(
            select(RSVPRecord).where(RSVPRecord.contact_number == payload.contact_number)
        )
        existing = result.scalars().first()

    if existing:
        existing.submitted_at = datetime.now(timezone.utc)
        existing.full_name = payload.full_name
        existing.email = payload.email
        existing.status = payload.status
        existing.bringing_plus_one = payload.bringing_plus_one
        existing.kids_count = payload.kids_count
        existing.dietary_restrictions = payload.dietary_restrictions
        existing.message_to_batch = payload.message_to_batch
        record = existing
        verb = "updated"
    else:
        record = RSVPRecord(**payload.model_dump())
        db.add(record)
        verb = "submitted"

    record_action(
        db,
        f"{current_user.full_name} {verb} an RSVP ({payload.status})",
        actor_name=current_user.full_name,
        actor_user_id=current_user.id,
    )
    await db.commit()
    await db.refresh(record)
    return record


@router.get("", response_model=list[RSVPPublicOut])
async def list_public_rsvps(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RSVPRecord).order_by(RSVPRecord.submitted_at.desc()))
    return result.scalars().all()


@router.get("/admin", response_model=list[RSVPOut])
async def list_admin_rsvps(
    db: AsyncSession = Depends(get_db), actor=Depends(get_organizer_actor)
):
    result = await db.execute(select(RSVPRecord).order_by(RSVPRecord.submitted_at.desc()))
    return result.scalars().all()
