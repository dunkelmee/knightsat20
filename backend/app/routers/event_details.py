from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import EventDetails
from app.schemas import EventDetailsOut, EventDetailsUpdate
from app.security import get_current_user, require_admin

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


@router.put("", response_model=EventDetailsOut, dependencies=[Depends(require_admin)])
async def update_event_details(payload: EventDetailsUpdate, db: AsyncSession = Depends(get_db)):
    details = await _get_or_create(db)
    for field, value in payload.model_dump().items():
        setattr(details, field, value)
    details.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(details)
    return details
