from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import PlannedExpense, SurveyResponse
from app.schemas import DashboardStatsOut
from app.security import get_current_user

router = APIRouter(
    prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)]
)

_ATTENDANCE_BUCKETS = {
    "Yes, definitely!": "attending",
    "Most likely, but still confirming": "likely",
    "Not sure yet": "undecided",
    "Unfortunately, I won’t be able to attend": "declined",
}


@router.get("/stats", response_model=DashboardStatsOut)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    responses = (await db.execute(select(SurveyResponse))).scalars().all()
    expenses = (await db.execute(select(PlannedExpense))).scalars().all()

    total_pledges = sum(r.computed_pledge_amount or 0 for r in responses)
    total_expenses = sum(int(e.amount or 0) for e in expenses)

    counts = Counter(_ATTENDANCE_BUCKETS.get(r.attendance) for r in responses)

    month_tally: Counter[str] = Counter()
    venue_tally: Counter[str] = Counter()
    for r in responses:
        for month in r.preferred_months or []:
            month_tally[month] += 1
        venue_tally[r.preferred_venue_type or "Hotel / function room"] += 1

    return DashboardStatsOut(
        total_surveys=len(responses),
        total_pledges=total_pledges,
        total_expenses=total_expenses,
        running_balance=total_pledges - total_expenses,
        attending_count=counts.get("attending", 0),
        likely_count=counts.get("likely", 0),
        undecided_count=counts.get("undecided", 0),
        declined_count=counts.get("declined", 0),
        estimated_headcount=counts.get("attending", 0) + counts.get("likely", 0),
        pledging_count=sum(1 for r in responses if (r.computed_pledge_amount or 0) > 0),
        month_tally=dict(month_tally),
        venue_tally=dict(venue_tally),
    )
