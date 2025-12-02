from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.farm import Farm
from app.services.area_service import to_hectares, geocode_city
from app.services.weather_service import fetch_weather
from app.ml.model_service import run_crop_prediction
from app.schemas.predict_schema import CropPredictRequest, CropPredictResponse, CropRecommendRequest

router = APIRouter(prefix="/prediction", tags=["Prediction"])


@router.get("/health")
async def prediction_health():
    return {"status": "ok"}


@router.post("/crop", response_model=CropPredictResponse)
async def crop_predict(payload: CropPredictRequest):
    try:
        result = run_crop_prediction(payload.model_dump())
        return CropPredictResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/recommendation", response_model=CropPredictResponse)
async def crop_recommend(payload: CropRecommendRequest, db: Session = Depends(get_db)):
    farm: Farm | None = db.query(Farm).filter(Farm.id == payload.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    area_h = to_hectares(float(farm.total_area), farm.area_unit)
    coords = await geocode_city(payload.city)
    if not coords:
        raise HTTPException(status_code=400, detail="City not found")
    lat, lon = coords
    weather = await fetch_weather(lat, lon)

    model_input = {
        "crop_type": payload.crop_type,
        "n": payload.n,
        "p": payload.p,
        "k": payload.k,
        "ph": payload.ph,
        "area_hectares": area_h,
        "temperature": weather["temperature"],
        "humidity": weather["humidity"],
        "rainfall": weather["rainfall"],
    }

    try:
        result = run_crop_prediction(model_input)
        return CropPredictResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
