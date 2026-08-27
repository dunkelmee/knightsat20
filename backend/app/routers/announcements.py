from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import Announcement
from app.schemas import AnnouncementCreate, AnnouncementOut
from app.security import Actor, get_current_user, get_organizer_actor

router = APIRouter(
    prefix="/api/announcements", tags=["announcements"], dependencies=[Depends(get_current_user)]
)


@router.get("", response_model=list[AnnouncementOut])
async def list_announcements(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Announcement).order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{announcement_id}/like", response_model=AnnouncementOut)
async def like_announcement(announcement_id: str, db: AsyncSession = Depends(get_db)):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    announcement.likes_count += 1
    await db.commit()
    await db.refresh(announcement)
    return announcement


@router.post("", response_model=AnnouncementOut)
async def create_announcement(
    payload: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    announcement = Announcement(**payload.model_dump())
    db.add(announcement)
    record_action(
        db, f"{actor.name} posted announcement \"{announcement.title}\"",
        actor_name=actor.name, actor_user_id=actor.user_id,
    )
    await db.commit()
    await db.refresh(announcement)
    return announcement


@router.put("/{announcement_id}", response_model=AnnouncementOut)
async def update_announcement(
    announcement_id: str,
    payload: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    for field, value in payload.model_dump().items():
        setattr(announcement, field, value)
    record_action(
        db, f"{actor.name} updated announcement \"{announcement.title}\"",
        actor_name=actor.name, actor_user_id=actor.user_id,
    )
    await db.commit()
    await db.refresh(announcement)
    return announcement


@router.delete("/{announcement_id}", status_code=204)
async def delete_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    record_action(
        db, f"{actor.name} deleted announcement \"{announcement.title}\"",
        actor_name=actor.name, actor_user_id=actor.user_id,
    )
    await db.delete(announcement)
    await db.commit()


@router.patch("/{announcement_id}/pin", response_model=AnnouncementOut)
async def toggle_pin_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    announcement.is_pinned = not announcement.is_pinned
    verb = "pinned" if announcement.is_pinned else "unpinned"
    record_action(
        db, f"{actor.name} {verb} announcement \"{announcement.title}\"",
        actor_name=actor.name, actor_user_id=actor.user_id,
    )
    await db.commit()
    await db.refresh(announcement)
    return announcement
