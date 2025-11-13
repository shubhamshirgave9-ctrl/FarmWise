from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models.farm import Farm
from app.schemas.report_schemas import FarmReportResponse
from app.utils.profit_calculator import calculate_farm_profit
from app.routes.farms import get_current_user_id

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/farm/{farm_id}", response_model=FarmReportResponse)
async def get_farm_report(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get profit/loss report for a specific farm"""
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
    
    profit_data = calculate_farm_profit(db, farm_uuid)
    
    return FarmReportResponse(
        farm_id=farm_uuid,
        total_expenses=profit_data["total_expenses"],
        total_income=profit_data["total_income"],
        net_profit=profit_data["net_profit"],
        profit_status=profit_data["profit_status"]
    )

