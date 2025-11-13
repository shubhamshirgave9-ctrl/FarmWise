from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models.farm import Farm
from app.schemas.report_schemas import FarmSummaryResponse
from app.utils.profit_calculator import calculate_farm_profit
from app.routes.farms import get_current_user_id

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/farm-summary", response_model=FarmSummaryResponse)
async def get_farm_summary(
    farmId: str = Query(..., alias="farmId"),
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get farm profit/loss summary for dashboard"""
    try:
        farm_uuid = UUID(farmId)
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
    
    profit_data = calculate_farm_profit(db, farm_uuid)
    
    return FarmSummaryResponse(
        farm_id=farm_uuid,
        total_expense=profit_data["total_expenses"],
        total_income=profit_data["total_income"],
        net_profit=profit_data["net_profit"],
        profit_status=profit_data["profit_status"],
        profit_percentage=profit_data["profit_percentage"]
    )

