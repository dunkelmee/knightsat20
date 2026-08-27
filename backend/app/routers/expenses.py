from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit import record_action
from app.database import get_db
from app.models import PlannedExpense
from app.schemas import PlannedExpenseCreate, PlannedExpenseOut
from app.security import Actor, get_current_user, get_organizer_actor

router = APIRouter(prefix="/api/expenses", tags=["expenses"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[PlannedExpenseOut])
async def list_expenses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlannedExpense).order_by(PlannedExpense.updated_at.desc()))
    return result.scalars().all()


@router.post("", response_model=PlannedExpenseOut)
async def create_expense(
    payload: PlannedExpenseCreate,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    expense = PlannedExpense(**payload.model_dump())
    db.add(expense)
    record_action(
        db, f"{actor.name} added expense \"{expense.name}\"", actor_name=actor.name, actor_user_id=actor.user_id
    )
    await db.commit()
    await db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=PlannedExpenseOut)
async def update_expense(
    expense_id: str,
    payload: PlannedExpenseCreate,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    expense = await db.get(PlannedExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for field, value in payload.model_dump().items():
        setattr(expense, field, value)
    record_action(
        db, f"{actor.name} updated expense \"{expense.name}\"", actor_name=actor.name, actor_user_id=actor.user_id
    )
    await db.commit()
    await db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(
    expense_id: str,
    db: AsyncSession = Depends(get_db),
    actor: Actor = Depends(get_organizer_actor),
):
    expense = await db.get(PlannedExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    record_action(
        db, f"{actor.name} deleted expense \"{expense.name}\"", actor_name=actor.name, actor_user_id=actor.user_id
    )
    await db.delete(expense)
    await db.commit()
