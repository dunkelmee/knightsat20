import base64
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import SurveyResponse, User
from app.schemas import (
    DirectoryCountsOut,
    DirectoryListOut,
    DirectoryPersonOut,
    DirectoryUpdateRequest,
)
from app.security import get_current_user
from app.storage import resolve_url

router = APIRouter(tags=["directory"], dependencies=[Depends(get_current_user)])

# Survey attendance answers that count as "planning to be there" — see
# SurveySection.tsx / types.ts for the full set of options.
_ATTENDING_ANSWERS = ["Yes, definitely!", "Most likely, but still confirming"]

_CURSOR_SEP = "\x1f"


def _encode_cursor(full_name: str, user_id: str) -> str:
    raw = f"{full_name}{_CURSOR_SEP}{user_id}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def _decode_cursor(cursor: str) -> tuple[str, str] | None:
    try:
        raw = base64.urlsafe_b64decode(cursor.encode()).decode()
        name, user_id = raw.split(_CURSOR_SEP, 1)
        return name, user_id
    except Exception:
        return None


def _status_expr():
    attending_subq = (
        select(SurveyResponse.user_id)
        .where(SurveyResponse.user_id.isnot(None))
        .where(SurveyResponse.attendance.in_(_ATTENDING_ANSWERS))
        .distinct()
    )
    return case(
        (User.is_faculty.is_(True), "faculty"),
        (User.id.in_(attending_subq), "attending"),
        else_="missing",
    )


@router.get("/api/directory", response_model=DirectoryListOut)
async def list_directory(
    q: str | None = Query(default=None),
    filter: Literal["all", "attending", "missing", "faculty"] = Query(default="all"),
    cursor: str | None = Query(default=None),
    limit: int = Query(default=24, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    status_col = _status_expr().label("status")
    base = select(User, status_col).where(User.show_in_directory.is_(True))

    if q:
        term = f"%{q.strip()}%"
        base = base.where(
            or_(
                User.full_name.ilike(term),
                User.current_city.ilike(term),
                User.current_role.ilike(term),
                User.section_hs.ilike(term),
            )
        )

    if filter != "all":
        base = base.where(status_col == filter)

    if cursor:
        decoded = _decode_cursor(cursor)
        if decoded:
            cursor_name, cursor_id = decoded
            base = base.where(
                or_(
                    User.full_name > cursor_name,
                    and_(User.full_name == cursor_name, User.id > cursor_id),
                )
            )

    base = base.order_by(User.full_name.asc(), User.id.asc()).limit(limit + 1)
    rows = (await db.execute(base)).all()

    next_cursor = None
    if len(rows) > limit:
        last_user, _ = rows[limit - 1]
        next_cursor = _encode_cursor(last_user.full_name, last_user.id)
        rows = rows[:limit]

    people: list[DirectoryPersonOut] = [
        DirectoryPersonOut(
            id=user.id,
            display_name=user.full_name,
            current_city=user.current_city,
            current_role=user.current_role,
            section_hs=user.section_hs,
            then_photo_url=resolve_url(user.then_photo_url),
            now_photo_url=resolve_url(user.now_photo_url),
            status=status,
            last_seen_city=user.current_city if status == "missing" and not user.now_photo_url else None,
        )
        for user, status in rows
    ]

    counts_base = select(User.id).where(User.show_in_directory.is_(True))
    all_ids = (await db.execute(counts_base)).scalars().all()
    counts = DirectoryCountsOut(all=len(all_ids), attending=0, missing=0, faculty=0)
    if all_ids:
        faculty_count = (
            await db.execute(
                select(func.count())
                .select_from(User)
                .where(User.show_in_directory.is_(True))
                .where(User.is_faculty.is_(True))
            )
        ).scalar_one()
        attending_count = (
            await db.execute(
                select(func.count(func.distinct(User.id)))
                .select_from(User)
                .join(SurveyResponse, SurveyResponse.user_id == User.id)
                .where(User.show_in_directory.is_(True))
                .where(User.is_faculty.is_(False))
                .where(SurveyResponse.attendance.in_(_ATTENDING_ANSWERS))
            )
        ).scalar_one()
        counts.faculty = faculty_count
        counts.attending = attending_count
        counts.missing = counts.all - faculty_count - attending_count

    return DirectoryListOut(total=counts.all, counts=counts, next_cursor=next_cursor, people=people)


@router.patch("/api/profile/directory", response_model=DirectoryPersonOut)
async def update_directory_profile(
    payload: DirectoryUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.current_city = payload.current_city
    current_user.current_role = payload.current_role
    current_user.section_hs = payload.section_hs
    current_user.show_in_directory = payload.show_in_directory
    record_action(
        db, f"{current_user.full_name} updated their directory listing",
        actor_name=current_user.full_name, actor_user_id=current_user.id,
    )
    await db.commit()
    await db.refresh(current_user)

    return DirectoryPersonOut(
        id=current_user.id,
        display_name=current_user.full_name,
        current_city=current_user.current_city,
        current_role=current_user.current_role,
        section_hs=current_user.section_hs,
        then_photo_url=resolve_url(current_user.then_photo_url),
        now_photo_url=resolve_url(current_user.now_photo_url),
        status="faculty" if current_user.is_faculty else "missing",
        last_seen_city=None,
    )
