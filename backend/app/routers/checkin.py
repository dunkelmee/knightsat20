"""Event-entrance QR check-in.

Each user has a permanent `checkin_code` (see app/models.py) rendered as a QR
image here. On the day of the event an organizer scans it and this API tells
them who it is and whether a +1 is expected, then records the check-in.

No frontend surfaces any of this yet (no "My QR Code" screen, no scanner UI)
— these are provisions for that to be built on top of later.
"""

import io
from datetime import datetime, timezone

import qrcode
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import SurveyResponse, User
from app.schemas import CheckInConfirmRequest, CheckInLookupOut
from app.security import Actor, get_current_user, get_organizer_actor
from app.storage import resolve_url

router = APIRouter(prefix="/api/checkin", tags=["checkin"])


def _qr_png(data: str) -> bytes:
    image = qrcode.make(data, border=2)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


async def _get_user_by_checkin_code(db: AsyncSession, code: str) -> User:
    result = await db.execute(select(User).where(User.checkin_code == code))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="QR code not recognized")
    return user


async def _expected_plus_one(db: AsyncSession, user_id: str) -> bool | None:
    """None when the attendee never submitted a survey response at all."""
    result = await db.execute(select(SurveyResponse).where(SurveyResponse.user_id == user_id))
    response = result.scalars().first()
    if not response:
        return None
    return response.bringing_plus_one == "Yes, 1 +1"


def _to_lookup_out(user: User, expected_plus_one: bool | None) -> CheckInLookupOut:
    return CheckInLookupOut(
        user_id=user.id,
        full_name=user.full_name,
        now_photo_url=resolve_url(user.now_photo_url),
        expected_plus_one=expected_plus_one,
        checked_in=user.checked_in_at is not None,
        checked_in_at=user.checked_in_at,
        checked_in_plus_one=user.checked_in_plus_one,
    )


@router.get("/me/qr-code")
async def get_my_qr_code(current_user: User = Depends(get_current_user)):
    return Response(content=_qr_png(current_user.checkin_code), media_type="image/png")


@router.get("/users/{user_id}/qr-code")
async def get_user_qr_code(
    user_id: str, db: AsyncSession = Depends(get_db), actor: Actor = Depends(get_organizer_actor)
):
    """Lets the committee print/export badges ahead of the event."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return Response(content=_qr_png(user.checkin_code), media_type="image/png")


@router.get("/scan/{code}", response_model=CheckInLookupOut)
async def scan_qr_code(
    code: str, db: AsyncSession = Depends(get_db), actor: Actor = Depends(get_organizer_actor)
):
    user = await _get_user_by_checkin_code(db, code)
    expected_plus_one = await _expected_plus_one(db, user.id)
    return _to_lookup_out(user, expected_plus_one)


@router.post("/scan/{code}", response_model=CheckInLookupOut)
async def confirm_check_in(
    code: str,
    payload: CheckInConfirmRequest,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    """Callable again on the same code to correct the +1 flag after a re-scan."""
    user = await _get_user_by_checkin_code(db, code)
    user.checked_in_at = datetime.now(timezone.utc)
    user.checked_in_plus_one = payload.plus_one
    record_action(
        db,
        f"{actor.name} checked in {user.full_name} at the entrance" + (" (+1)" if payload.plus_one else ""),
        actor_name=actor.name,
        actor_user_id=actor.user_id,
    )
    await db.commit()
    expected_plus_one = await _expected_plus_one(db, user.id)
    return _to_lookup_out(user, expected_plus_one)
