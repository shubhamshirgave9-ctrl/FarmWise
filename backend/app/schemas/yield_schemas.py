from pydantic import BaseModel, Field, ConfigDict
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


class FarmYieldCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    crop_name: Optional[str] = Field(default=None, alias="cropName")
    quantity: float
    unit: str = "kg"
    rate: float
    sold_price: float = Field(..., alias="soldPrice")
    date: date
    notes: Optional[str] = Field(default=None, alias="notes")


class FarmYieldItem(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    crop_name: str = Field(serialization_alias="cropName")
    date: date
    quantity: float
    unit: str
    rate: float
    sold_price: float = Field(serialization_alias="soldPrice")
    total_income: float = Field(serialization_alias="totalIncome")
    notes: Optional[str] = None
