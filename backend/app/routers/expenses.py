from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import PlannedExpense
from app.schemas import PlannedExpenseCreate, PlannedExpenseOut
from app.security import require_admin

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("", response_model=list[PlannedExpenseOut])
async def list_expenses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlannedExpense).order_by(PlannedExpense.updated_at.desc()))
    return result.scalars().all()


@router.post("", response_model=PlannedExpenseOut, dependencies=[Depends(require_admin)])
async def create_expense(payload: PlannedExpenseCreate, db: AsyncSession = Depends(get_db)):
    expense = PlannedExpense(**payload.model_dump())
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=PlannedExpenseOut, dependencies=[Depends(require_admin)])
async def update_expense(
    expense_id: str, payload: PlannedExpenseCreate, db: AsyncSession = Depends(get_db)
):
    expense = await db.get(PlannedExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for field, value in payload.model_dump().items():
        setattr(expense, field, value)
    await db.commit()
    await db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_expense(expense_id: str, db: AsyncSession = Depends(get_db)):
    expense = await db.get(PlannedExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await db.delete(expense)
    await db.commit()
