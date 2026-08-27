from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import ScoutedVenue
from app.schemas import ScoutedVenueCreate, ScoutedVenueOut
from app.security import require_admin

# Committee-internal venue shortlist — never surfaced to attendees, so every
# route (including reads) is admin-gated, unlike expenses/announcements which
# alumni can view.
router = APIRouter(
    prefix="/api/scouted-venues", tags=["scouted-venues"], dependencies=[Depends(require_admin)]
)


@router.get("", response_model=list[ScoutedVenueOut])
async def list_scouted_venues(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScoutedVenue).order_by(ScoutedVenue.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=ScoutedVenueOut)
async def create_scouted_venue(payload: ScoutedVenueCreate, db: AsyncSession = Depends(get_db)):
    venue = ScoutedVenue(**payload.model_dump())
    db.add(venue)
    await db.commit()
    await db.refresh(venue)
    return venue


@router.put("/{venue_id}", response_model=ScoutedVenueOut)
async def update_scouted_venue(
    venue_id: str, payload: ScoutedVenueCreate, db: AsyncSession = Depends(get_db)
):
    venue = await db.get(ScoutedVenue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Scouted venue not found")
    for field, value in payload.model_dump().items():
        setattr(venue, field, value)
    await db.commit()
    await db.refresh(venue)
    return venue


@router.delete("/{venue_id}", status_code=204)
async def delete_scouted_venue(venue_id: str, db: AsyncSession = Depends(get_db)):
    venue = await db.get(ScoutedVenue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Scouted venue not found")
    await db.delete(venue)
    await db.commit()
