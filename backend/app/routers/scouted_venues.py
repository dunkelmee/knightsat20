from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import ScoutedVenue
from app.schemas import ScoutedVenueCreate, ScoutedVenueOut
from app.security import Actor, get_organizer_actor

# Committee-internal venue shortlist — never surfaced to attendees, so every
# route (including reads) is organizer/superadmin-gated via get_organizer_actor.
router = APIRouter(prefix="/api/scouted-venues", tags=["scouted-venues"])


@router.get("", response_model=list[ScoutedVenueOut])
async def list_scouted_venues(db: AsyncSession = Depends(get_db), actor: Actor = Depends(get_organizer_actor)):
    result = await db.execute(select(ScoutedVenue).order_by(ScoutedVenue.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=ScoutedVenueOut)
async def create_scouted_venue(
    payload: ScoutedVenueCreate,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    venue = ScoutedVenue(**payload.model_dump())
    db.add(venue)
    record_action(db, f"{actor.name} added scouted venue \"{venue.name}\"", actor_name=actor.name, actor_user_id=actor.user_id)
    await db.commit()
    await db.refresh(venue)
    return venue


@router.put("/{venue_id}", response_model=ScoutedVenueOut)
async def update_scouted_venue(
    venue_id: str,
    payload: ScoutedVenueCreate,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    venue = await db.get(ScoutedVenue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Scouted venue not found")
    for field, value in payload.model_dump().items():
        setattr(venue, field, value)
    record_action(db, f"{actor.name} updated scouted venue \"{venue.name}\"", actor_name=actor.name, actor_user_id=actor.user_id)
    await db.commit()
    await db.refresh(venue)
    return venue


@router.delete("/{venue_id}", status_code=204)
async def delete_scouted_venue(
    venue_id: str, db: AsyncSession = Depends(get_db), actor: Actor = Depends(get_organizer_actor)
):
    venue = await db.get(ScoutedVenue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Scouted venue not found")
    record_action(db, f"{actor.name} removed scouted venue \"{venue.name}\"", actor_name=actor.name, actor_user_id=actor.user_id)
    await db.delete(venue)
    await db.commit()
