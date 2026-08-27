import base64
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import Album, Photo, User
from app.schemas import AlbumCreate, AlbumDetailOut, AlbumOut, AlbumUpdate, ContributorOut, PhotoOut
from app.security import get_current_user, is_organizer_or_superadmin
from app.storage import delete_photo_files, resolve_url, save_photo_files
from app.text_utils import initials

router = APIRouter(prefix="/api/albums", tags=["albums"], dependencies=[Depends(get_current_user)])

# Client pre-resizes every upload before it reaches the server (see
# src/utils/imageResize.ts) — this just guards against a misbehaving client.
_MAX_UPLOAD_BYTES = 8 * 1024 * 1024
_ALLOWED_CONTENT_TYPES = {"image/jpeg"}

_CURSOR_SEP = "\x1f"


def _encode_photo_cursor(created_at: datetime, photo_id: str) -> str:
    raw = f"{created_at.isoformat()}{_CURSOR_SEP}{photo_id}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def _decode_photo_cursor(cursor: str) -> tuple[datetime, str] | None:
    try:
        raw = base64.urlsafe_b64decode(cursor.encode()).decode()
        ts, photo_id = raw.split(_CURSOR_SEP, 1)
        return datetime.fromisoformat(ts), photo_id
    except Exception:
        return None


async def _get_album_or_404(db: AsyncSession, album_id: str) -> Album:
    album = await db.get(Album, album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    return album


def _can_moderate(is_organizer: bool, owner_id: str, current_user: User) -> bool:
    return is_organizer or owner_id == current_user.id


async def _build_album_out(db: AsyncSession, album: Album) -> tuple[AlbumOut, datetime]:
    photo_count = (
        await db.execute(select(func.count()).select_from(Photo).where(Photo.album_id == album.id))
    ).scalar_one()
    contributor_count = (
        await db.execute(
            select(func.count(func.distinct(Photo.uploaded_by))).where(Photo.album_id == album.id)
        )
    ).scalar_one()
    recent_photos = (
        await db.execute(
            select(Photo).where(Photo.album_id == album.id).order_by(Photo.created_at.desc()).limit(20)
        )
    ).scalars().all()

    contributors: list[ContributorOut] = []
    seen_uploaders: set[str] = set()
    for photo in recent_photos:
        if photo.uploaded_by in seen_uploaders:
            continue
        seen_uploaders.add(photo.uploaded_by)
        uploader = await db.get(User, photo.uploaded_by)
        if uploader:
            contributors.append(ContributorOut(initials=initials(uploader.full_name)))
        if len(contributors) >= 3:
            break

    last_activity = recent_photos[0].created_at if recent_photos else album.created_at
    album_out = AlbumOut(
        id=album.id,
        title=album.title,
        description=album.description,
        is_live_day=album.is_live_day,
        photo_count=photo_count,
        contributor_count=contributor_count,
        cover_thumb_url=resolve_url(recent_photos[0].thumb_key) if recent_photos else None,
        recent_thumb_urls=[resolve_url(p.thumb_key) for p in recent_photos[:3]],
        contributors=contributors,
    )
    return album_out, last_activity


def _to_photo_out(photo: Photo, uploader_name: str) -> PhotoOut:
    return PhotoOut(
        id=photo.id,
        thumb_url=resolve_url(photo.thumb_key),
        full_url=resolve_url(photo.storage_key),
        caption=photo.caption,
        uploader_initials=initials(uploader_name),
        uploaded_by=photo.uploaded_by,
        created_at=photo.created_at,
    )


@router.get("", response_model=list[AlbumOut])
async def list_albums(db: AsyncSession = Depends(get_db)):
    albums = (await db.execute(select(Album))).scalars().all()
    built = [await _build_album_out(db, album) for album in albums]
    built.sort(key=lambda pair: (0 if pair[0].is_live_day else 1, -pair[1].timestamp()))
    return [album_out for album_out, _ in built]


@router.post("", response_model=AlbumOut)
async def create_album(
    payload: AlbumCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    album = Album(title=payload.title.strip(), description=payload.description, created_by=current_user.id)
    db.add(album)
    record_action(
        db, f"{current_user.full_name} created album \"{album.title}\"",
        actor_name=current_user.full_name, actor_user_id=current_user.id,
    )
    await db.commit()
    await db.refresh(album)
    album_out, _ = await _build_album_out(db, album)
    return album_out


@router.get("/{album_id}", response_model=AlbumDetailOut)
async def get_album(
    album_id: str,
    cursor: str | None = Query(default=None),
    limit: int = Query(default=30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    album = await _get_album_or_404(db, album_id)

    query = select(Photo).where(Photo.album_id == album_id)
    if cursor:
        decoded = _decode_photo_cursor(cursor)
        if decoded:
            cursor_created_at, cursor_id = decoded
            query = query.where(
                or_(
                    Photo.created_at < cursor_created_at,
                    and_(Photo.created_at == cursor_created_at, Photo.id < cursor_id),
                )
            )
    query = query.order_by(Photo.created_at.desc(), Photo.id.desc()).limit(limit + 1)
    photos = (await db.execute(query)).scalars().all()

    next_cursor = None
    if len(photos) > limit:
        last_kept = photos[limit - 1]
        next_cursor = _encode_photo_cursor(last_kept.created_at, last_kept.id)
        photos = photos[:limit]

    uploader_names: dict[str, str] = {}
    photo_outs: list[PhotoOut] = []
    for photo in photos:
        if photo.uploaded_by not in uploader_names:
            uploader = await db.get(User, photo.uploaded_by)
            uploader_names[photo.uploaded_by] = uploader.full_name if uploader else "?"
        photo_outs.append(_to_photo_out(photo, uploader_names[photo.uploaded_by]))

    photo_count = (
        await db.execute(select(func.count()).select_from(Photo).where(Photo.album_id == album_id))
    ).scalar_one()

    return AlbumDetailOut(
        id=album.id,
        title=album.title,
        description=album.description,
        is_live_day=album.is_live_day,
        created_by=album.created_by,
        photo_count=photo_count,
        next_cursor=next_cursor,
        photos=photo_outs,
    )


@router.patch("/{album_id}", response_model=AlbumOut)
async def update_album(
    album_id: str,
    payload: AlbumUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    album = await _get_album_or_404(db, album_id)
    is_organizer = is_organizer_or_superadmin(request, current_user)
    if not _can_moderate(is_organizer, album.created_by, current_user):
        raise HTTPException(status_code=403, detail="Only the album creator or an organizer can edit this album")

    if payload.title is not None:
        album.title = payload.title.strip()
    if payload.description is not None:
        album.description = payload.description
    if payload.is_live_day is not None:
        if not is_organizer:
            raise HTTPException(status_code=403, detail="Only an organizer can change the live-day album")
        if payload.is_live_day:
            await db.execute(
                Album.__table__.update().where(Album.id != album_id).values(is_live_day=False)
            )
        album.is_live_day = payload.is_live_day

    record_action(
        db, f"{current_user.full_name} updated album \"{album.title}\"",
        actor_name=current_user.full_name, actor_user_id=current_user.id,
    )
    await db.commit()
    await db.refresh(album)
    album_out, _ = await _build_album_out(db, album)
    return album_out


@router.delete("/{album_id}", status_code=204)
async def delete_album(
    album_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    album = await _get_album_or_404(db, album_id)
    if not _can_moderate(is_organizer_or_superadmin(request, current_user), album.created_by, current_user):
        raise HTTPException(status_code=403, detail="Only the album creator or an organizer can delete this album")

    photos = (await db.execute(select(Photo).where(Photo.album_id == album_id))).scalars().all()
    for photo in photos:
        delete_photo_files(photo.storage_key, photo.thumb_key)

    record_action(
        db, f"{current_user.full_name} deleted album \"{album.title}\"",
        actor_name=current_user.full_name, actor_user_id=current_user.id,
    )
    await db.delete(album)  # DB-level ON DELETE CASCADE removes the photo rows
    await db.commit()


@router.post("/{album_id}/photos", response_model=list[PhotoOut])
async def upload_photos(
    album_id: str,
    full: list[UploadFile] = File(...),
    thumb: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    album = await _get_album_or_404(db, album_id)

    if not full or len(full) != len(thumb):
        raise HTTPException(status_code=400, detail="Each photo needs a matching full + thumb pair")

    created: list[Photo] = []
    for full_file, thumb_file in zip(full, thumb):
        for upload in (full_file, thumb_file):
            if upload.content_type not in _ALLOWED_CONTENT_TYPES:
                raise HTTPException(status_code=400, detail="Only JPEG uploads are accepted")

        full_bytes = await full_file.read()
        thumb_bytes = await thumb_file.read()
        if len(full_bytes) > _MAX_UPLOAD_BYTES or len(thumb_bytes) > _MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=400, detail="Photo is too large")

        photo_id = str(uuid.uuid4())
        storage_key, thumb_key = save_photo_files(album_id, photo_id, full_bytes, thumb_bytes)
        photo = Photo(
            id=photo_id,
            album_id=album_id,
            uploaded_by=current_user.id,
            storage_key=storage_key,
            thumb_key=thumb_key,
        )
        db.add(photo)
        created.append(photo)

    record_action(
        db, f"{current_user.full_name} added {len(created)} photo(s) to album \"{album.title}\"",
        actor_name=current_user.full_name, actor_user_id=current_user.id,
    )
    await db.commit()
    for photo in created:
        await db.refresh(photo)

    return [_to_photo_out(photo, current_user.full_name) for photo in created]


@router.delete("/{album_id}/photos/{photo_id}", status_code=204)
async def delete_photo(
    album_id: str,
    photo_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    photo = await db.get(Photo, photo_id)
    if not photo or photo.album_id != album_id:
        raise HTTPException(status_code=404, detail="Photo not found")
    if not _can_moderate(is_organizer_or_superadmin(request, current_user), photo.uploaded_by, current_user):
        raise HTTPException(status_code=403, detail="Only the uploader or an organizer can delete this photo")

    delete_photo_files(photo.storage_key, photo.thumb_key)
    record_action(
        db, f"{current_user.full_name} deleted a photo from an album",
        actor_name=current_user.full_name, actor_user_id=current_user.id,
    )
    await db.delete(photo)
    await db.commit()
