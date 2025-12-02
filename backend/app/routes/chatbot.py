from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from sqlalchemy.orm import Session
from uuid import UUID
import os
from app.database import get_db
from app.models.chat_history import ChatHistory
from app.routes.farms import get_current_user_id
from app.services.chatbot.openrouter import send_message
from app.services.chatbot.plantid import identify_image
from app.config import settings

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.get("/health")
async def chatbot_health():
    return {"status": "ok"}


@router.get("/history")
async def get_history(current_user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    items = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user_id)
        .order_by(ChatHistory.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": str(i.id),
            "message": i.message,
            "response": i.response,
            "created_at": i.created_at,
        }
        for i in items
    ]


@router.post("/message")
async def post_message(
    message: str = Form(...),
    context: str | None = Form(None),
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = await send_message(message, context)
    reply = result.get("reply", "")
    item = ChatHistory(user_id=current_user_id, message=message, response=reply)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"reply": reply, "history_id": str(item.id)}


@router.post("/identify")
async def identify(
    image: UploadFile = File(...),
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    data = await image.read()
    result = await identify_image(data)

    # Save file if configured
    saved_path = None
    if settings.CHATBOT_IMAGE_UPLOAD_DIR:
        os.makedirs(settings.CHATBOT_IMAGE_UPLOAD_DIR, exist_ok=True)
        saved_path = os.path.join(settings.CHATBOT_IMAGE_UPLOAD_DIR, image.filename or "upload.jpg")
        try:
            with open(saved_path, "wb") as f:
                f.write(data)
        except Exception:
            saved_path = None

    summary = f"Plant: {result.get('plant')} (confidence: {result.get('confidence')})"
    if saved_path:
        summary += f" | image: {saved_path}"

    item = ChatHistory(user_id=current_user_id, message=f"[identify] {image.filename}", response=summary)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"result": result, "history_id": str(item.id)}
