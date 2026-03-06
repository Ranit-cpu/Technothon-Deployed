from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.SiteSettings import SiteSettings
from app.models.auth_models import SiteSettingsSchema

DEFAULTS = {"sponsors": True, "inspiration": True, "joinUs": True}


class SiteSettingsService:

    @staticmethod
    async def get_all_settings(db: AsyncSession) -> dict:
        result = await db.execute(select(SiteSettings))
        rows = result.scalars().all()
        settings = dict(DEFAULTS)
        for row in rows:
            settings[row.key] = row.value
        return settings

    @staticmethod
    async def upsert_settings(payload: SiteSettingsSchema, db: AsyncSession) -> dict:
        data = payload.model_dump()
        for key, value in data.items():
            result = await db.execute(
                select(SiteSettings).where(SiteSettings.key == key)
            )
            row = result.scalars().first()
            if row:
                row.value = value
            else:
                db.add(SiteSettings(key=key, value=value))
        await db.commit()
        return await SiteSettingsService.get_all_settings(db)