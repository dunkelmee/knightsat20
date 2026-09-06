from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import Announcement, AnnouncementLike, User
from app.schemas import AnnouncementCreate, AnnouncementOut
from app.security import Actor, get_current_user, get_organizer_actor

router = APIRouter(
    prefix="/api/announcements", tags=["announcements"], dependencies=[Depends(get_current_user)]
)


def _to_out(announcement: Announcement, liked_by_me: bool) -> AnnouncementOut:
    return AnnouncementOut(
        id=announcement.id,
        title=announcement.title,
        caption=announcement.caption,
        image_url=announcement.image_url,
        tag=announcement.tag,
        author=announcement.author,
        date=announcement.date,
        is_pinned=announcement.is_pinned,
        likes_count=announcement.likes_count,
        liked_by_me=liked_by_me,
    )


async def _liked_announcement_ids(db: AsyncSession, user_id: str | None) -> set[str]:
    if not user_id:
        return set()
    result = await db.execute(select(AnnouncementLike.announcement_id).where(AnnouncementLike.user_id == user_id))
    return set(result.scalars().all())


@router.get("", response_model=list[AnnouncementOut])
async def list_announcements(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Announcement).order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
    )
    announcements = result.scalars().all()
    liked_ids = await _liked_announcement_ids(db, current_user.id)
    return [_to_out(a, a.id in liked_ids) for a in announcements]


@router.post("/{announcement_id}/like", response_model=AnnouncementOut)
async def like_announcement(
    announcement_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    existing = await db.execute(
        select(AnnouncementLike).where(
            AnnouncementLike.announcement_id == announcement_id,
            AnnouncementLike.user_id == current_user.id,
        )
    )
    like = existing.scalars().first()

    if like:
        await db.delete(like)
        announcement.likes_count = max(0, announcement.likes_count - 1)
        liked_by_me = False
    else:
        db.add(AnnouncementLike(announcement_id=announcement_id, user_id=current_user.id))
        announcement.likes_count += 1
        liked_by_me = True

    await db.commit()
    await db.refresh(announcement)
    return _to_out(announcement, liked_by_me)


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
    return _to_out(announcement, False)


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
    liked_ids = await _liked_announcement_ids(db, actor.user_id)
    return _to_out(announcement, announcement.id in liked_ids)


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
    liked_ids = await _liked_announcement_ids(db, actor.user_id)
    return _to_out(announcement, announcement.id in liked_ids)
