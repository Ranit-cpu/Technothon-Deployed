from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, and_
from starlette.templating import Jinja2Templates
from datetime import datetime

from app.database import get_sql_session
from app.models.Users_models import User
from app.models.event_models import Event
from app.models.team_models import Team
from app.models.participant_models import Participant
from app.models.payment_models import Payment

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


@router.get("/payment")
async def payment_page(request: Request, db: AsyncSession = Depends(get_sql_session)):
    """
    Payment page - shows payment form for the live event
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")

    # Get live event
    live_event_result = await db.execute(
        select(Event).where(Event.is_live == 1)
    )
    live_event = live_event_result.scalar_one_or_none()

    if not live_event:
        raise HTTPException(status_code=404, detail="No live event found")

    # Get user's participant record for live event ONLY
    participant_result = await db.execute(
        select(Participant)
        .where(
            and_(
                Participant.user_id == user_id,
                Participant.event_id == live_event.eid
            )
        )
    )
    participant = participant_result.scalar_one_or_none()

    if not participant:
        raise HTTPException(
            status_code=404,
            detail=f"You are not registered for the current event ({live_event.name}). Please register first."
        )

    # Get team information
    team_result = await db.execute(
        select(Team).where(Team.tid == participant.team_id)
    )
    team = team_result.scalar_one_or_none()

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check if payment already made
    if team.transaction_id:
        raise HTTPException(
            status_code=400,
            detail="Payment already completed for this team"
        )

    return templates.TemplateResponse("payment.html", {
        "request": request,
        "team": team,
        "participant": participant,
        "event": live_event
    })


@router.post("/payment/submit")
async def submit_payment(request: Request, db: AsyncSession = Depends(get_sql_session)):
    """
    Submit payment information for the live event
    Handles users who are registered in multiple events
    """
    user_id = request.session.get("user_id")
    if not user_id:
        return JSONResponse(
            status_code=403,
            content={"detail": "Unauthorized access - Please login"}
        )

    data = await request.json()

    transaction_id = data.get("transaction_id", "").strip()
    bank_name = data.get("bank_name", "").strip()
    upi_id = data.get("upi_id", "").strip()

    # Validate required fields
    if not transaction_id:
        return JSONResponse(
            status_code=400,
            content={"detail": "Transaction ID is required"}
        )

    # Get live event
    live_event_result = await db.execute(
        select(Event).where(Event.is_live == 1)
    )
    live_event = live_event_result.scalar_one_or_none()

    if not live_event:
        return JSONResponse(
            status_code=404,
            content={"detail": "No live event found"}
        )

    # IMPORTANT: Filter by BOTH user_id AND event_id
    # This allows the same user to be in multiple events (e.g., TT04 and TT05)
    # but ensures we only get their registration for the CURRENT live event
    participant_result = await db.execute(
        select(Participant)
        .where(
            and_(
                Participant.user_id == user_id,
                Participant.event_id == live_event.eid
            )
        )
    )
    participant = participant_result.scalar_one_or_none()

    if not participant:
        # Get all events user is registered for (for better error message)
        all_participants_result = await db.execute(
            select(Participant).where(Participant.user_id == user_id)
        )
        all_participants = all_participants_result.scalars().all()

        if all_participants:
            event_ids = [p.event_id for p in all_participants]
            return JSONResponse(
                status_code=404,
                content={
                    "detail": f"You are not registered for the current live event ({live_event.name}, ID: {live_event.eid}). You are registered for events: {', '.join(event_ids)}. Please register for the live event first."
                }
            )
        else:
            return JSONResponse(
                status_code=404,
                content={
                    "detail": f"You are not registered for any event. Please register for the live event ({live_event.name}) first."
                }
            )

    # Check if participant has a team
    if not participant.team_id:
        return JSONResponse(
            status_code=400,
            content={"detail": "You are not part of any team for this event"}
        )

    # Get team
    team_result = await db.execute(
        select(Team).where(Team.tid == participant.team_id)
    )
    team = team_result.scalar_one_or_none()

    if not team:
        return JSONResponse(
            status_code=404,
            content={"detail": "Team not found"}
        )

    # Verify team is for the correct event
    if team.event_id != live_event.eid:
        return JSONResponse(
            status_code=400,
            content={
                "detail": f"Team mismatch. Your team is registered for event {team.event_id}, but the live event is {live_event.eid}"
            }
        )

    # Check if payment already exists for this team
    if team.transaction_id:
        return JSONResponse(
            status_code=400,
            content={"detail": "Payment already completed for this team"}
        )

    # Check if transaction ID already exists in database
    existing_payment_result = await db.execute(
        select(Payment).where(Payment.transaction_id == transaction_id)
    )
    existing_payment = existing_payment_result.scalar_one_or_none()

    if existing_payment:
        return JSONResponse(
            status_code=400,
            content={"detail": "This transaction ID has already been used"}
        )

    try:
        # Create payment record
        payment = Payment(
            transaction_id=transaction_id,
            bank_name=bank_name,
            upi_id=upi_id,
            paid_at=datetime.utcnow(),
            status="PENDING"  # Payment is pending verification
        )
        db.add(payment)

        # Update team with transaction_id only
        # DO NOT touch the 'registered' field - it's managed by another route
        await db.execute(
            update(Team)
            .where(Team.tid == team.tid)
            .values(transaction_id=transaction_id)
        )

        await db.commit()

        return JSONResponse(
            status_code=200,
            content={
                "message": "Payment information submitted successfully!",
                "transaction_id": transaction_id,
                "event": live_event.name,
                "team": team.name
            }
        )

    except Exception as e:
        await db.rollback()
        print(f"Payment submission error: {str(e)}")  # Add logging
        return JSONResponse(
            status_code=500,
            content={"detail": f"Payment submission failed: {str(e)}"}
        )


@router.get("/user/registrations")
async def get_user_registrations(request: Request, db: AsyncSession = Depends(get_sql_session)):
    """
    Get all event registrations for the current user
    Useful for debugging and showing user their registrations
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")

    # Get all participant records for user
    participants_result = await db.execute(
        select(Participant).where(Participant.user_id == user_id)
    )
    participants = participants_result.scalars().all()

    if not participants:
        return JSONResponse(
            status_code=200,
            content={
                "message": "You are not registered for any events",
                "registrations": []
            }
        )

    # Build response with event and team details
    registrations = []
    for participant in participants:
        # Get event details
        event_result = await db.execute(
            select(Event).where(Event.eid == participant.event_id)
        )
        event = event_result.scalar_one_or_none()

        # Get team details
        team_result = await db.execute(
            select(Team).where(Team.tid == participant.team_id)
        )
        team = team_result.scalar_one_or_none()

        registrations.append({
            "participant_id": participant.pid,
            "event_id": participant.event_id,
            "event_name": event.name if event else "Unknown",
            "is_live_event": event.is_live == 1 if event else False,
            "team_id": participant.team_id,
            "team_name": team.name if team else "Unknown",
            "role": participant.role,
            "payment_submitted": team.transaction_id is not None if team else False,
            "registered": team.registered if team else False
        })

    return JSONResponse(
        status_code=200,
        content={
            "user_id": user_id,
            "total_registrations": len(registrations),
            "registrations": registrations
        }
    )


@router.post("/register/event/{event_id}/team/{team_id}")
async def register_for_event(
        event_id: str,
        team_id: str,
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """
    Register user for an event with a specific team
    Prevents duplicate registrations in the same event (enforced by DB constraint)
    """
    user_id = request.session.get("user_id")
    if not user_id:
        return JSONResponse(
            status_code=403,
            content={"detail": "Unauthorized access"}
        )

    # Get user details
    user_result = await db.execute(
        select(User).where(User.uid == user_id)
    )
    user = user_result.scalar_one_or_none()

    if not user:
        return JSONResponse(
            status_code=404,
            content={"detail": "User not found"}
        )

    # Check if event exists
    event_result = await db.execute(
        select(Event).where(Event.eid == event_id)
    )
    event = event_result.scalar_one_or_none()

    if not event:
        return JSONResponse(
            status_code=404,
            content={"detail": "Event not found"}
        )

    # Check if team exists
    team_result = await db.execute(
        select(Team).where(Team.tid == team_id)
    )
    team = team_result.scalar_one_or_none()

    if not team:
        return JSONResponse(
            status_code=404,
            content={"detail": "Team not found"}
        )

    # Verify team is for this event
    if team.event_id != event_id:
        return JSONResponse(
            status_code=400,
            content={"detail": f"Team {team_id} is not registered for event {event_id}"}
        )

    # Check if user is already registered for this event
    existing_participant = await db.execute(
        select(Participant).where(
            and_(
                Participant.user_id == user_id,
                Participant.event_id == event_id
            )
        )
    )
    if existing_participant.scalar_one_or_none():
        return JSONResponse(
            status_code=400,
            content={"detail": f"You are already registered for event {event.name}"}
        )

    try:
        # Generate unique participant ID
        participant_id = f"P{user_id}_{event_id}"

        # Create participant record
        participant = Participant(
            pid=participant_id,
            name=user.name if hasattr(user, 'name') else None,
            email=user.email if hasattr(user, 'email') else None,
            user_id=user_id,
            team_id=team_id,
            event_id=event_id,
            role="member"  # Default role
        )
        db.add(participant)

        await db.commit()

        return JSONResponse(
            status_code=200,
            content={
                "message": f"Successfully registered for {event.name}",
                "participant_id": participant_id,
                "event": event.name,
                "team": team.name
            }
        )

    except Exception as e:
        await db.rollback()

        # Check if it's a duplicate entry error
        if "Duplicate entry" in str(e) or "unique_user_per_event" in str(e):
            return JSONResponse(
                status_code=400,
                content={"detail": "You are already registered for this event"}
            )

        return JSONResponse(
            status_code=500,
            content={"detail": f"Registration failed: {str(e)}"}
        )