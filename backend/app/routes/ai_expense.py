from fastapi import APIRouter, Body
from app.utils.ai_extractor import extract_expense

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/expense-parse")
async def expense_parse(payload: dict = Body(...)):
    text = str(payload.get("text", "")).strip()
    if not text:
        return {"error": "text is required"}
    result = extract_expense(text)
    return {"parsed": result}
