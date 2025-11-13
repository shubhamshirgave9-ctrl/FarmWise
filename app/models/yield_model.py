from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Yield(Base):
    __tablename__ = "yields"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    crop_name = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    quantity_kg = Column(Numeric(10, 2), nullable=False)
    price_per_kg = Column(Numeric(10, 2), nullable=False)
    total_income = Column(Numeric(10, 2), nullable=False)
    buyer_notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    farm = relationship("Farm", back_populates="yields")


