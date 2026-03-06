from sqlalchemy import Column, String, Boolean
from app.models.base import Base

class SiteSettings(Base):
    __tablename__ = "site_settings"

    key = Column(String, primary_key=True)
    value = Column(Boolean, nullable=False, default=True)