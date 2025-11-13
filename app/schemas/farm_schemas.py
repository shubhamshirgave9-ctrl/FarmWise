from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class Location(BaseModel):
    lat: float
    lon: float


class FarmCreate(BaseModel):
    name: str
    total_area: float
    area_unit: str
    location: Optional[Location] = None


class FarmResponse(BaseModel):
    id: UUID
    name: str
    total_area: float
    area_unit: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


