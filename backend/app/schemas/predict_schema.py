from pydantic import BaseModel, Field
from uuid import UUID


class CropPredictRequest(BaseModel):
    crop_type: str = Field(default="Generic")
    n: float = 0
    p: float = 0
    k: float = 0
    ph: float = 7.0
    rainfall: float = 0.0
    temperature: float = 0.0
    area_hectares: float = 1.0


class CropPredictResponse(BaseModel):
    recommended_crop: str
    expected_yield: float
    confidence: float


class CropRecommendRequest(BaseModel):
    farm_id: UUID
    crop_type: str
    n: float
    p: float
    k: float
    ph: float
    city: str
