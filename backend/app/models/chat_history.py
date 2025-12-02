from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.utils.db_types import GUID


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="chat_history")
