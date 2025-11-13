from pydantic import BaseModel
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


