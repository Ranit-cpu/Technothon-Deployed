# FIXED: app/routers/admin/create_event.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.auth_models import EventIn
from app.database import get_sql_session
from app.services.create_event_service import create_event_service
from app.routers.admin.admin_dashboard import get_current_admin_id, verify_admin_exists

router = APIRouter(prefix="/admin/event", tags=["Admin Events"])


@router.post("/createEvent")
async def create_event(
        event: EventIn,
        request: Request,  # ✅ ADDED: To verify admin session
        db: AsyncSession = Depends(get_sql_session),
):
    # ✅ ADDED: Verify admin authentication
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    # ✅ Create event
    new_event = await create_event_service(event, db)

    # ✅ FIXED: Return complete event data for frontend
    return {
        "message": "Event created successfully",
        "event_id": new_event.eid,  # Frontend expects this field
        "eid": new_event.eid,
        "name": new_event.name,
        "event_name": new_event.name,  # Alternative field name
        "description": new_event.description,
        "event_type": new_event.event_type,
        "start_date": str(new_event.start_date),
        "end_date": str(new_event.end_date),
        "prize_details": new_event.prize_details,
        "is_live": new_event.is_live
    }