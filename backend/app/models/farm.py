from sqlalchemy import Column, String, DateTime, Float, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.utils.db_types import GUID


class Farm(Base):
    __tablename__ = "farms"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    farm_type = Column(String, nullable=True)
    total_area = Column(Numeric(10, 2), nullable=False)
    area_unit = Column(String, nullable=False, default="acre")
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="farms")
    expenses = relationship("Expense", back_populates="farm", cascade="all, delete-orphan")
    yields = relationship("Yield", back_populates="farm", cascade="all, delete-orphan")
