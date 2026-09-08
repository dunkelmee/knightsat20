from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import RSVPRecord, User
from app.schemas import RSVPCreate, RSVPOut, RSVPPublicOut
from app.security import get_current_user, get_organizer_actor, require_user_or_superadmin
from app.storage import resolve_url

# The gate admits the superadmin as well as logged-in alumni, because
# GET /admin below is organizer-gated and the superadmin is meant to pass
# that. POST still names get_current_user itself, so creating an RSVP
# continues to require a real account.
router = APIRouter(prefix="/api/rsvps", tags=["rsvps"], dependencies=[Depends(require_user_or_superadmin)])


async def _photo_urls(db: AsyncSession, records: list[RSVPRecord]) -> dict[str, str | None]:
    """Profile avatars for the accounts behind these cards, keyed by rsvp id.

    Only for people listed in the directory — opting out of the directory is
    the one signal we have that someone would rather not have their photo on
    display, so the wall honours it and falls back to initials.
    """
    user_ids = {r.user_id for r in records if r.user_id}
    if not user_ids:
        return {}
    users = (await db.execute(select(User).where(User.id.in_(user_ids)))).scalars().all()
    by_user = {
        u.id: resolve_url(u.now_photo_url or u.then_photo_url)
        for u in users
        if u.show_in_directory
    }
    return {r.id: by_user.get(r.user_id) for r in records if r.user_id}


def _with_photo(record: RSVPRecord, photos: dict[str, str | None], out_cls):
    return out_cls.model_validate(record).model_copy(update={"photo_url": photos.get(record.id)})


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
        existing.plus_ones_count = payload.plus_ones_count
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
    return _with_photo(record, await _photo_urls(db, [record]), RSVPOut)


@router.get("", response_model=list[RSVPPublicOut])
async def list_public_rsvps(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RSVPRecord).order_by(RSVPRecord.submitted_at.desc()))
    records = list(result.scalars().all())
    photos = await _photo_urls(db, records)
    return [_with_photo(r, photos, RSVPPublicOut) for r in records]


@router.get("/admin", response_model=list[RSVPOut])
async def list_admin_rsvps(
    db: AsyncSession = Depends(get_db), actor=Depends(get_organizer_actor)
):
    result = await db.execute(select(RSVPRecord).order_by(RSVPRecord.submitted_at.desc()))
    records = list(result.scalars().all())
    photos = await _photo_urls(db, records)
    return [_with_photo(r, photos, RSVPOut) for r in records]
