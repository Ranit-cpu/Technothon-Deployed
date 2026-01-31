from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from werkzeug.security import generate_password_hash

from app.database import get_sql_session
from app.models.Users_models import User
from app.models.auth_models import ForgetPasswordRequest,ValidateUser

router = APIRouter(prefix="/auth", tags=["Auth"])

# CHECK STUDENT ID

@router.post("/check-user-id")
async def check_user_id( data: ValidateUser, sn: AsyncSession = Depends(get_sql_session)):
    rs = await sn.execute(select(User).where(User.uid == data.user_id, User.email == data.email))
    u = rs.scalars().first()

    if not u:
        raise HTTPException(404, "Student ID not found in list")

    return {
        "message": "Student ID verified","user_id": u.uid,"email": u.email}

# FORGET PASSWORD
@router.put("/forget-password")
async def forget_password(dt: ForgetPasswordRequest,sn: AsyncSession = Depends(get_sql_session)):

    rs = await sn.execute(select(User).where(User.uid == dt.user_id))
    u = rs.scalars().first()

    if not u:
        raise HTTPException(404, "User ID or Email is not valid")

    if dt.new_password != dt.reenter_password:
        raise HTTPException(400, "Passwords do not match with New_Password")

    if len(dt.new_password) < 6:
        raise HTTPException(400, "Password must be contain at least 6 characters")

    u.password = generate_password_hash(dt.new_password)
    sn.add(u)
    await sn.commit()

    return {"message": "Password reset successfully"}