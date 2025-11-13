from decimal import Decimal
from typing import Dict, List, Union
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.expense import Expense
from app.models.yield_model import Yield


def calculate_farm_profit(db: Session, farm_id: Union[str, UUID]) -> Dict:
    """Calculate profit/loss for a farm"""
    # Convert to UUID if string
    if isinstance(farm_id, str):
        farm_id = UUID(farm_id)
    
    # Calculate total expenses
    total_expenses_result = db.query(func.sum(Expense.amount)).filter(
        Expense.farm_id == farm_id
    ).scalar()
    total_expenses = Decimal(str(total_expenses_result)) if total_expenses_result else Decimal("0")
    
    # Calculate total income
    total_income_result = db.query(func.sum(Yield.total_income)).filter(
        Yield.farm_id == farm_id
    ).scalar()
    total_income = Decimal(str(total_income_result)) if total_income_result else Decimal("0")
    
    # Calculate net profit
    net_profit = total_income - total_expenses
    
    # Determine profit status
    profit_status = "Profit" if net_profit > 0 else "Loss" if net_profit < 0 else "Break Even"
    
    # Calculate profit percentage
    profit_percentage = 0.0
    if total_expenses > 0:
        profit_percentage = float((net_profit / total_expenses) * 100)
    elif total_income > 0:
        profit_percentage = 100.0
    
    return {
        "total_expenses": float(total_expenses),
        "total_income": float(total_income),
        "net_profit": float(net_profit),
        "profit_status": profit_status,
        "profit_percentage": round(profit_percentage, 2)
    }


def get_expense_trends(db: Session, farm_id: Union[str, UUID], from_date: str = None, to_date: str = None) -> List[Dict]:
    """Get expense trends grouped by date"""
    # Convert to UUID if string
    if isinstance(farm_id, str):
        farm_id = UUID(farm_id)
    
    query = db.query(
        Expense.date,
        func.sum(Expense.amount).label("total")
    ).filter(Expense.farm_id == farm_id)
    
    if from_date:
        query = query.filter(Expense.date >= from_date)
    if to_date:
        query = query.filter(Expense.date <= to_date)
    
    results = query.group_by(Expense.date).order_by(Expense.date).all()
    
    return [
        {
            "date": str(result.date),
            "total": float(result.total)
        }
        for result in results
    ]

