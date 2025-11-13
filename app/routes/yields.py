from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from uuid import UUID
from app.database import get_db
from app.models.yield_model import Yield
from app.models.farm import Farm
from app.schemas.yield_schemas import YieldCreate, YieldResponse
from app.routes.farms import get_current_user_id

router = APIRouter(prefix="/yields", tags=["Yields"])


@router.post("", response_model=YieldResponse, status_code=status.HTTP_201_CREATED)
async def create_yield(
    yield_data: YieldCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new yield (crop selling record)"""
    # Verify farm belongs to user
    farm = db.query(Farm).filter(
        Farm.id == yield_data.farm_id,
        Farm.user_id == current_user_id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    # Calculate total income
    total_income = Decimal(str(yield_data.quantity_kg)) * Decimal(str(yield_data.price_per_kg))
    
    yield_record = Yield(
        farm_id=yield_data.farm_id,
        crop_name=yield_data.crop_name,
        date=yield_data.date,
        quantity_kg=yield_data.quantity_kg,
        price_per_kg=yield_data.price_per_kg,
        total_income=float(total_income),
        buyer_notes=yield_data.buyer_notes
    )
    db.add(yield_record)
    db.commit()
    db.refresh(yield_record)
    
    return yield_record


@router.get("/farm/{farm_id}", response_model=list[YieldResponse])
async def get_farm_yields(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all yields for a specific farm"""
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
    
    yields = db.query(Yield).filter(Yield.farm_id == farm_uuid).all()
    return yields

