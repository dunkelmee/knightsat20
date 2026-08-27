from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import EventDetails
from app.schemas import EventDetailsOut, EventDetailsUpdate
from app.security import Actor, get_current_user, get_organizer_actor

router = APIRouter(
    prefix="/api/event-details", tags=["event-details"], dependencies=[Depends(get_current_user)]
)


async def _get_or_create(db: AsyncSession) -> EventDetails:
    details = await db.get(EventDetails, EventDetails.SINGLETON_ID)
    if not details:
        details = EventDetails(id=EventDetails.SINGLETON_ID)
        db.add(details)
        await db.commit()
        await db.refresh(details)
    return details


@router.get("", response_model=EventDetailsOut)
async def get_event_details(db: AsyncSession = Depends(get_db)):
    return await _get_or_create(db)


@router.put("", response_model=EventDetailsOut)
async def update_event_details(
    payload: EventDetailsUpdate,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    details = await _get_or_create(db)
    for field, value in payload.model_dump().items():
        setattr(details, field, value)
    details.updated_at = datetime.now(timezone.utc)
    record_action(db, f"{actor.name} updated the event date/venue details", actor_name=actor.name, actor_user_id=actor.user_id)
    await db.commit()
    await db.refresh(details)
    return details
