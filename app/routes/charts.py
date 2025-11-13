from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.database import get_db
from app.models.farm import Farm
from app.schemas.report_schemas import ExpenseChartResponse, ChartDataPoint
from app.utils.profit_calculator import get_expense_trends
from app.routes.farms import get_current_user_id

router = APIRouter(prefix="/charts", tags=["Charts"])


@router.get("/expenses", response_model=ExpenseChartResponse)
async def get_expense_chart(
    farmId: str = Query(..., alias="farmId"),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get expense trends chart data for a farm"""
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
    
    chart_data = get_expense_trends(db, farm_uuid, from_date, to_date)
    
    return ExpenseChartResponse(
        farm_id=farm_uuid,
        chart_type="line",
        data=[ChartDataPoint(**item) for item in chart_data]
    )

