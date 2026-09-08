from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import delete, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import Album, AuditLog, OtpCode, Photo, RSVPRecord, SurveyResponse, User
from app.routers.auth import to_profile_out
from app.schemas import (
    AdminUserOut,
    AuditLogOut,
    OrganizerUpdateRequest,
    SuperadminPasswordConfirm,
    UserProfileOut,
)
from app.security import check_superadmin_password, require_superadmin
from app.storage import delete_photo_files, delete_profile_photo
from app.superadmin_lockout import check_not_locked_out, record_failed_attempt

router = APIRouter(prefix="/api/superadmin", tags=["superadmin"], dependencies=[Depends(require_superadmin)])


@router.get("/users", response_model=list[AdminUserOut])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return [
        AdminUserOut(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            created_at=user.created_at,
            is_organizer=user.is_organizer,
            onboarding_completed=user.onboarding_completed_at is not None,
        )
        for user in result.scalars().all()
    ]


@router.get("/users/{user_id}", response_model=UserProfileOut)
async def get_user_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    """The full profile behind a row in the users list.

    The list endpoint above deliberately stays lean — it renders every account
    at once — so the detail view fetches on demand instead.
    """
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return to_profile_out(user)


@router.patch("/users/{user_id}/organizer", response_model=AdminUserOut)
async def update_organizer_status(
    user_id: str, payload: OrganizerUpdateRequest, db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_organizer = payload.is_organizer
    verb = "granted" if payload.is_organizer else "revoked"
    record_action(db, f"Superadmin {verb} organizer access for {user.full_name}", actor_name="Superadmin")
    await db.commit()
    await db.refresh(user)

    return AdminUserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        created_at=user.created_at,
        is_organizer=user.is_organizer,
        onboarding_completed=user.onboarding_completed_at is not None,
    )


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str, payload: SuperadminPasswordConfirm, request: Request, db: AsyncSession = Depends(get_db)
):
    """Permanently deletes an account and everything tied to it: profile
    photos, OTP codes, their survey response and matching RSVP, photos they
    uploaded anywhere, and albums they created. Albums they created are
    deleted outright rather than reassigned — there's no ownership-transfer
    flow, so any photos other people added to that album go with it. Audit
    log entries are kept for the historical record, just detached from the
    now-deleted account (actor_name already carries the display name).

    Requires re-entering the superadmin password even though the session is
    already superadmin-gated — a step-up check so an unattended/hijacked
    session can't be used to wipe an account without the password. Shares the
    same per-IP lockout as the login form.
    """
    ip = request.client.host if request.client else None
    await check_not_locked_out(db, ip)
    if not check_superadmin_password(payload.password):
        await record_failed_attempt(db, ip, "delete-user re-auth")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password.")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    full_name = user.full_name

    own_photos = (await db.execute(select(Photo).where(Photo.uploaded_by == user_id))).scalars().all()
    for photo in own_photos:
        delete_photo_files(photo.storage_key, photo.thumb_key)
    await db.execute(delete(Photo).where(Photo.uploaded_by == user_id))

    created_albums = (await db.execute(select(Album).where(Album.created_by == user_id))).scalars().all()
    for album in created_albums:
        remaining_photos = (
            await db.execute(select(Photo).where(Photo.album_id == album.id))
        ).scalars().all()
        for photo in remaining_photos:
            delete_photo_files(photo.storage_key, photo.thumb_key)
        await db.delete(album)  # DB-level ON DELETE CASCADE removes any remaining photo rows

    await db.execute(delete(OtpCode).where(OtpCode.user_id == user_id))
    await db.execute(delete(SurveyResponse).where(SurveyResponse.user_id == user_id))
    await db.execute(
        delete(RSVPRecord).where(
            or_(RSVPRecord.contact_number == user.mobile_number, RSVPRecord.email == user.email)
        )
    )
    await db.execute(update(AuditLog).where(AuditLog.actor_user_id == user_id).values(actor_user_id=None))

    delete_profile_photo(user.then_photo_url)
    delete_profile_photo(user.now_photo_url)

    record_action(db, f"Superadmin deleted {full_name}'s account and data", actor_name="Superadmin")
    await db.delete(user)
    await db.commit()


@router.get("/audit-logs", response_model=list[AuditLogOut])
async def list_audit_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(200))
    return result.scalars().all()
