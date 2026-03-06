from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_sql_session
from app.services.SiteSettingsService import SiteSettingsService
from app.models.auth_models import SiteSettingsSchema

router = APIRouter(prefix="/site-settings", tags=["Site Settings"])

# ------------------- ROUTES -------------------#
#-----------------------------------------------#

@router.get("/")
async def read_settings(db: AsyncSession = Depends(get_sql_session)):
    return await SiteSettingsService.get_all_settings(db)


@router.put("/")
async def update_settings(
    payload: SiteSettingsSchema,
    db: AsyncSession = Depends(get_sql_session)
):
    return await SiteSettingsService.upsert_settings(payload, db)