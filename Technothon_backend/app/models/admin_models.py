from sqlalchemy import Column, String
from app.models.base import Base

class Admin(Base):
    __tablename__ = "admins"

    
    # Define columns first
    admin_id = Column(String(11), primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    password = Column(String(255), nullable=False)
