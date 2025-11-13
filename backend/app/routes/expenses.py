from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models.expense import Expense
from app.models.farm import Farm
from app.schemas.expense_schemas import ExpenseCreate, ExpenseResponse
from app.routes.farms import get_current_user_id

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_data: ExpenseCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new expense"""
    # Verify farm belongs to user
    farm = db.query(Farm).filter(
        Farm.id == expense_data.farm_id,
        Farm.user_id == current_user_id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    expense = Expense(
        farm_id=expense_data.farm_id,
        crop_name=expense_data.crop_name,
        date=expense_data.date,
        category=expense_data.category,
        amount=expense_data.amount,
        note=expense_data.note
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    
    return expense


@router.get("/farm/{farm_id}", response_model=list[ExpenseResponse])
async def get_farm_expenses(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all expenses for a specific farm"""
    try:
        farm_uuid = UUID(farm_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid farm ID format"
        )
    # Verify farm belongs to user
    farm = db.query(Farm).filter(
        Farm.id == farm_uuid,
        Farm.user_id == current_user_id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    expenses = db.query(Expense).filter(Expense.farm_id == farm_uuid).all()
    return expenses

