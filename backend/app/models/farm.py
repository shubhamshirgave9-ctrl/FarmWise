from sqlalchemy import Column, String, Numeric, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    total_area = Column(Numeric(10, 2), nullable=False)
    area_unit = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    expenses = relationship("Expense", back_populates="farm", cascade="all, delete-orphan")
    yields = relationship("Yield", back_populates="farm", cascade="all, delete-orphan")


