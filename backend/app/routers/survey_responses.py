from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.companions import has_plus_one, plus_one_count
from app.database import get_db
from app.models import RSVPRecord, SurveyResponse, User
from app.pledge import parse_pledge_amount
from app.schemas import PaymentStatusUpdate, SurveyResponseCreate, SurveyResponseOut
from app.security import Actor, get_current_user, get_organizer_actor

router = APIRouter(prefix="/api/survey-responses", tags=["survey-responses"])

# Survey answer -> attendance-wall card status. Every answer is mapped, and
# every mapped answer earns a card: editing the survey moves an existing card
# instead of leaving a stale "Attending" behind, and a first-time "not sure" or
# "can't join" still shows up on the wall (as "Maybe" / "Can't join") rather
# than silently going missing.
_RSVP_STATUS_BY_ATTENDANCE = {
    "Yes, definitely!": "Attending",
    "Most likely, but still confirming": "Most likely",
    "Not sure yet": "Maybe",
    "Unfortunately, I won’t be able to attend": "Decline",
}


async def _sync_rsvp_from_survey(db: AsyncSession, response: SurveyResponse) -> None:
    status = _RSVP_STATUS_BY_ATTENDANCE.get(response.attendance)
    if status is None:
        return

    result = await db.execute(
        select(RSVPRecord).where(
            (RSVPRecord.contact_number == response.contact_number)
            | (RSVPRecord.full_name.ilike(response.full_name))
        )
    )
    existing = result.scalars().first()

    kids_count = (
        response.kids_count
        if response.bringing_kids == "Yes" and isinstance(response.kids_count, int)
        else 0
    )
    message = response.other_suggestions or None

    if existing:
        existing.submitted_at = datetime.now(timezone.utc)
        existing.user_id = response.user_id
        existing.full_name = response.full_name
        existing.contact_number = response.contact_number
        existing.email = response.email
        existing.status = status
        existing.bringing_plus_one = has_plus_one(response)
        existing.plus_ones_count = plus_one_count(response)
        existing.kids_count = kids_count
        existing.message_to_batch = message
    else:
        db.add(
            RSVPRecord(
                submitted_at=datetime.now(timezone.utc),
                user_id=response.user_id,
                full_name=response.full_name,
                contact_number=response.contact_number,
                email=response.email,
                status=status,
                bringing_plus_one=has_plus_one(response),
                plus_ones_count=plus_one_count(response),
                kids_count=kids_count,
                message_to_batch=message,
            )
        )


@router.get("/me", response_model=SurveyResponseOut | None)
async def get_my_survey_response(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SurveyResponse).where(SurveyResponse.user_id == current_user.id)
    )
    return result.scalars().first()


@router.post("", response_model=SurveyResponseOut)
async def create_survey_response(
    payload: SurveyResponseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # The survey stays open indefinitely with a single editable response per
    # user — resubmitting updates the existing row in place rather than
    # accumulating a new one (a deadline may later gate this, not yet).
    computed_pledge_amount = parse_pledge_amount(payload.pledge_option, payload.custom_pledge_amount)
    result = await db.execute(
        select(SurveyResponse).where(SurveyResponse.user_id == current_user.id)
    )
    response = result.scalars().first()
    is_new = response is None

    if is_new:
        response = SurveyResponse(user_id=current_user.id)
        db.add(response)
    else:
        response.submitted_at = datetime.now(timezone.utc)

    for field, value in payload.model_dump().items():
        setattr(response, field, value)
    response.full_name = current_user.full_name
    response.contact_number = current_user.mobile_number
    response.email = current_user.email
    response.computed_pledge_amount = computed_pledge_amount

    await db.flush()
    await _sync_rsvp_from_survey(db, response)
    record_action(
        db,
        f"{current_user.full_name} {'submitted' if is_new else 'updated'} the reunion survey",
        actor_name=current_user.full_name,
        actor_user_id=current_user.id,
    )
    await db.commit()
    await db.refresh(response)
    return response


# GET/DELETE/PATCH below are reachable by organizers and the superadmin alike
# (see security.get_organizer_actor) — this is what makes "superadmin sees
# survey responses similar to organizers" work off the same endpoint.


@router.get("", response_model=list[SurveyResponseOut])
async def list_survey_responses(
    db: AsyncSession = Depends(get_db), actor: Actor = Depends(get_organizer_actor)
):
    result = await db.execute(select(SurveyResponse).order_by(SurveyResponse.submitted_at.desc()))
    return result.scalars().all()


@router.delete("/{response_id}", status_code=204)
async def delete_survey_response(
    response_id: str, db: AsyncSession = Depends(get_db), actor: Actor = Depends(get_organizer_actor)
):
    response = await db.get(SurveyResponse, response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Survey response not found")
    record_action(
        db,
        f"{actor.name} deleted {response.full_name}'s survey response",
        actor_name=actor.name,
        actor_user_id=actor.user_id,
    )
    await db.delete(response)
    await db.commit()


@router.patch("/{response_id}/payment-status", response_model=SurveyResponseOut)
async def update_payment_status(
    response_id: str,
    payload: PaymentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    response = await db.get(SurveyResponse, response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Survey response not found")
    response.pledge_paid_status = payload.status
    record_action(
        db,
        f"{actor.name} marked {response.full_name}'s pledge as {payload.status}",
        actor_name=actor.name,
        actor_user_id=actor.user_id,
    )
    await db.commit()
    await db.refresh(response)
    return response
