from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Announcement
from app.schemas import AnnouncementCreate, AnnouncementOut
from app.security import require_admin

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


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


@router.post("", response_model=AnnouncementOut, dependencies=[Depends(require_admin)])
async def create_announcement(payload: AnnouncementCreate, db: AsyncSession = Depends(get_db)):
    announcement = Announcement(**payload.model_dump())
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return announcement


@router.put(
    "/{announcement_id}", response_model=AnnouncementOut, dependencies=[Depends(require_admin)]
)
async def update_announcement(
    announcement_id: str, payload: AnnouncementCreate, db: AsyncSession = Depends(get_db)
):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    for field, value in payload.model_dump().items():
        setattr(announcement, field, value)
    await db.commit()
    await db.refresh(announcement)
    return announcement


@router.delete("/{announcement_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_announcement(announcement_id: str, db: AsyncSession = Depends(get_db)):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await db.delete(announcement)
    await db.commit()


@router.patch(
    "/{announcement_id}/pin", response_model=AnnouncementOut, dependencies=[Depends(require_admin)]
)
async def toggle_pin_announcement(announcement_id: str, db: AsyncSession = Depends(get_db)):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    announcement.is_pinned = not announcement.is_pinned
    await db.commit()
    await db.refresh(announcement)
    return announcement
