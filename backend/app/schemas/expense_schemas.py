from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import date, datetime


class ExpenseCreate(BaseModel):
    farm_id: UUID
    crop_name: str
    date: date
    category: str
    amount: float
    note: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: UUID
    farm_id: UUID
    crop_name: str
    date: date
    category: str
    amount: float
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FarmExpenseCreate(BaseModel):
    amount: float
    date: date
    category: str
    description: Optional[str] = None
    crop: Optional[str] = None


class FarmExpenseItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    category: str
    amount: float
    date: date
    description: Optional[str] = None
