from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class Location(BaseModel):
    lat: float
    lon: float


class FarmCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., alias="farmName")
    total_area: float = Field(..., alias="farmSize")
    area_unit: str = Field(default="acre", alias="areaUnit")
    farm_type: Optional[str] = Field(default=None, alias="farmType")
    location: Optional[Location] = None


class FarmResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    name: str
    farm_type: Optional[str] = Field(default=None, serialization_alias="type")
    total_area: float = Field(serialization_alias="totalArea")
    area_unit: str = Field(serialization_alias="areaUnit")
    lat: Optional[float] = None
    lon: Optional[float] = None
    created_at: datetime = Field(serialization_alias="createdAt")


class FarmListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    name: str
    type: Optional[str] = None
    size: str
    total_area: float = Field(serialization_alias="totalArea")
    area_unit: str = Field(serialization_alias="areaUnit")


class FarmDetailResponse(FarmListItem):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total_expenses: float = Field(serialization_alias="totalExpenses")
    total_yield: float = Field(serialization_alias="totalYield")
    net_profit: float = Field(serialization_alias="netProfit")
    profit_margin: float = Field(serialization_alias="profitMargin")








