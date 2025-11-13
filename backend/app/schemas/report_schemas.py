from pydantic import BaseModel
from uuid import UUID


class FarmReportResponse(BaseModel):
    farm_id: UUID
    total_expenses: float
    total_income: float
    net_profit: float
    profit_status: str


class FarmSummaryResponse(BaseModel):
    farm_id: UUID
    total_expense: float
    total_income: float
    net_profit: float
    profit_status: str
    profit_percentage: float


class ChartDataPoint(BaseModel):
    date: str
    total: float


class ExpenseChartResponse(BaseModel):
    farm_id: UUID
    chart_type: str
    data: list[ChartDataPoint]


