from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime


class YieldCreate(BaseModel):
    farm_id: UUID
    crop_name: str
    date: date
    quantity_kg: float
    price_per_kg: float
    buyer_notes: Optional[str] = None


class YieldResponse(BaseModel):
    id: UUID
    farm_id: UUID
    crop_name: str
    date: date
    quantity_kg: float
    price_per_kg: float
    total_income: float
    buyer_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


