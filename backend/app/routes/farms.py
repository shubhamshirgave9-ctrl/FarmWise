import io
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID
from app.database import get_db
from app.models.farm import Farm
from app.models.expense import Expense
from app.models.yield_model import Yield
from app.models.user import User
from app.schemas.farm_schemas import FarmCreate, FarmListItem, FarmDetailResponse
from app.schemas.expense_schemas import FarmExpenseCreate, FarmExpenseItem
from app.schemas.yield_schemas import FarmYieldCreate, FarmYieldItem
from fastapi.responses import StreamingResponse
from app.utils.jwt_handler import verify_token
from app.utils.profit_calculator import calculate_farm_profit
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/farms", tags=["Farms"])
security = HTTPBearer()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Dependency to get current user ID from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )
    # Verify user exists and is active
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    return user_id


def _format_farm_size(total_area, area_unit: str) -> str:
    try:
        area = float(total_area)
    except (TypeError, ValueError):
        return f"{total_area} {area_unit}"
    formatted = f"{area:.2f}".rstrip("0").rstrip(".")
    return f"{formatted} {area_unit}"


def _serialize_farm(farm: Farm) -> FarmListItem:
    return FarmListItem(
        id=farm.id,
        name=farm.name,
        type=farm.farm_type,
        size=_format_farm_size(farm.total_area, farm.area_unit),
        total_area=float(farm.total_area),
        area_unit=farm.area_unit,
    )


def _serialize_farm_detail(farm: Farm, db: Session) -> FarmDetailResponse:
    profit = calculate_farm_profit(db, farm.id)
    total_yield = float(db.query(func.sum(Yield.total_income)).filter(Yield.farm_id == farm.id).scalar() or 0)
    return FarmDetailResponse(
        **_serialize_farm(farm).model_dump(),
        total_expenses=profit["total_expenses"],
        total_yield=total_yield,
        net_profit=profit["net_profit"],
        profit_margin=profit["profit_percentage"],
    )


def _get_farm_for_user(db: Session, farm_id: str, user_id: UUID) -> Farm:
    try:
        farm_uuid = UUID(farm_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid farm ID format"
        )
    farm = db.query(Farm).filter(Farm.id == farm_uuid, Farm.user_id == user_id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    return farm


PDF_PLACEHOLDER = (
    b"%PDF-1.4\n"
    b"1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj\n"
    b"3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
    b"4 0 obj<</Length 44>>stream\n"
    b"BT /F1 18 Tf 72 720 Td (AgriSmart Report) Tj ET\n"
    b"endstream\nendobj\n"
    b"5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>endobj\n"
    b"xref\n0 6\n"
    b"0000000000 65535 f \n"
    b"0000000010 00000 n \n"
    b"0000000059 00000 n \n"
    b"0000000110 00000 n \n"
    b"0000000231 00000 n \n"
    b"0000000321 00000 n \n"
    b"trailer<</Size 6/Root 1 0 R>>\n"
    b"startxref\n"
    b"390\n"
    b"%%EOF"
)


def _pdf_response(filename: str) -> StreamingResponse:
    return StreamingResponse(
        io.BytesIO(PDF_PLACEHOLDER),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("", response_model=FarmDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_farm(
    farm_data: FarmCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new farm"""
    farm = Farm(
        user_id=current_user_id,
        name=farm_data.name,
        farm_type=farm_data.farm_type,
        total_area=farm_data.total_area,
        area_unit=farm_data.area_unit,
        lat=farm_data.location.lat if farm_data.location else None,
        lon=farm_data.location.lon if farm_data.location else None
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    
    return _serialize_farm_detail(farm, db)


@router.get("", response_model=List[FarmListItem])
async def get_farms(
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all farms for the current user"""
    farms = db.query(Farm).filter(Farm.user_id == current_user_id).all()
    return [_serialize_farm(farm) for farm in farms]


@router.get("/{farm_id}", response_model=FarmDetailResponse)
async def get_farm(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get a specific farm"""
    farm = _get_farm_for_user(db, farm_id, current_user_id)
    return _serialize_farm_detail(farm, db)


@router.get("/{farm_id}/summary", response_model=FarmDetailResponse)
async def get_farm_summary(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    farm = _get_farm_for_user(db, farm_id, current_user_id)
    return _serialize_farm_detail(farm, db)


@router.get("/{farm_id}/summary/pdf")
async def download_farm_summary_pdf(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    _get_farm_for_user(db, farm_id, current_user_id)
    return _pdf_response(f"farm-{farm_id}-summary.pdf")


@router.post("/{farm_id}/expenses", response_model=FarmExpenseItem, status_code=status.HTTP_201_CREATED)
async def add_farm_expense(
    farm_id: str,
    expense_data: FarmExpenseCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    farm = _get_farm_for_user(db, farm_id, current_user_id)
    expense = Expense(
        farm_id=farm.id,
        crop_name=expense_data.crop or farm.farm_type or "General",
        date=expense_data.date,
        category=expense_data.category,
        amount=expense_data.amount,
        note=expense_data.description
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return FarmExpenseItem(
        id=expense.id,
        category=expense.category,
        amount=float(expense.amount),
        date=expense.date,
        description=expense.note
    )


@router.get("/{farm_id}/expenses", response_model=List[FarmExpenseItem])
async def list_farm_expenses(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    farm = _get_farm_for_user(db, farm_id, current_user_id)
    expenses = db.query(Expense).filter(Expense.farm_id == farm.id).order_by(Expense.date.desc()).all()
    return [
        FarmExpenseItem(
            id=expense.id,
            category=expense.category,
            amount=float(expense.amount),
            date=expense.date,
            description=expense.note
        )
        for expense in expenses
    ]


@router.get("/{farm_id}/expenses/by-category")
async def expenses_by_category(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    farm = _get_farm_for_user(db, farm_id, current_user_id)
    results = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("total")
        )
        .filter(Expense.farm_id == farm.id)
        .group_by(Expense.category)
        .all()
    )
    return [
        {"category": row.category or "Uncategorized", "amount": float(row.total or 0)}
        for row in results
    ]


@router.get("/{farm_id}/expenses/trend")
async def expenses_trend(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    farm = _get_farm_for_user(db, farm_id, current_user_id)
    results = (
        db.query(
            Expense.date.label("date"),
            func.sum(Expense.amount).label("total")
        )
        .filter(Expense.farm_id == farm.id)
        .group_by(Expense.date)
        .order_by(Expense.date)
        .all()
    )
    return [
        {"month": row.date.strftime("%Y-%m"), "expenses": float(row.total or 0)}
        for row in results
    ]


@router.get("/{farm_id}/expenses/report/pdf")
async def download_expense_report_pdf(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    _get_farm_for_user(db, farm_id, current_user_id)
    return _pdf_response(f"farm-{farm_id}-expenses.pdf")


@router.get("/{farm_id}/expenses/graph/pdf")
async def download_expense_graph_pdf(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    _get_farm_for_user(db, farm_id, current_user_id)
    return _pdf_response(f"farm-{farm_id}-expenses-graph.pdf")


@router.post("/{farm_id}/yield", response_model=FarmYieldItem, status_code=status.HTTP_201_CREATED)
async def add_farm_yield(
    farm_id: str,
    yield_data: FarmYieldCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    farm = _get_farm_for_user(db, farm_id, current_user_id)
    unit_normalized = (yield_data.unit or "kg").lower()
    if unit_normalized in {"kg", "kilogram", "kilograms"}:
        quantity_in_kg = yield_data.quantity
    elif unit_normalized in {"ton", "tons", "tonne", "tonnes", "mt"}:
        quantity_in_kg = yield_data.quantity * 1000
    else:
        quantity_in_kg = yield_data.quantity
    price_per_kg = yield_data.rate
    total_income = yield_data.sold_price
    yield_record = Yield(
        farm_id=farm.id,
        crop_name=yield_data.crop_name or farm.farm_type or "General",
        date=yield_data.date,
        quantity_kg=quantity_in_kg,
        price_per_kg=price_per_kg,
        total_income=total_income,
        buyer_notes=yield_data.notes
    )
    db.add(yield_record)
    db.commit()
    db.refresh(yield_record)
    return FarmYieldItem(
        id=yield_record.id,
        crop_name=yield_record.crop_name,
        date=yield_record.date,
        quantity=float(yield_data.quantity),
        unit=yield_data.unit,
        rate=yield_data.rate,
        sold_price=yield_data.sold_price,
        total_income=float(yield_record.total_income),
        notes=yield_record.buyer_notes
    )


@router.get("/{farm_id}/yield", response_model=List[FarmYieldItem])
async def list_farm_yield(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    farm = _get_farm_for_user(db, farm_id, current_user_id)
    yields = db.query(Yield).filter(Yield.farm_id == farm.id).order_by(Yield.date.desc()).all()
    items: List[FarmYieldItem] = []
    for y in yields:
        items.append(
            FarmYieldItem(
                id=y.id,
                crop_name=y.crop_name,
                date=y.date,
                quantity=float(y.quantity_kg),
                unit="kg",
                rate=float(y.price_per_kg),
                sold_price=float(y.total_income),
                total_income=float(y.total_income),
                notes=y.buyer_notes
            )
        )
    return items


@router.get("/{farm_id}/profit/report/pdf")
async def download_profit_report_pdf(
    farm_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    _get_farm_for_user(db, farm_id, current_user_id)
    return _pdf_response(f"farm-{farm_id}-profit.pdf")

