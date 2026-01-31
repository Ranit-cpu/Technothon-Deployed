from sqlalchemy import select,func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event_models import Event
from app.models.participant_models import Participant
from app.models.team_models import Team
from app.models.Users_models import User
from app.models.food_models import Food

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event_models import Event
from app.models.participant_models import Participant
from app.models.team_models import Team
from app.models.Users_models import User


async def get_participants_details(db: AsyncSession):
    """
    Fetch all participants of the currently live event
    with team name and WhatsApp number
    """

    # 1. Get live event ID
    live_event_id = await db.scalar(
        select(Event.eid)
        .where(Event.is_live.is_(True))
        .limit(1)
    )

    if not live_event_id:
        return {"message": "No live event found"}

    # 2. Join Participant + Team + User
    stmt = (
        select(
            Participant.pid,
            Participant.name.label("participant_name"),
            Participant.role,
            Team.name.label("team_name"),
            User.Whatsapp_No.label("whatsapp_no"),
            Food.food_preference.label("food_preference")
        )
        .join(Team, Team.tid == Participant.team_id)
        .join(User, User.uid == Participant.user_id)
        .join(Food, Food.pid == Participant.pid)
        .where(Participant.event_id == live_event_id, Team.registered == True)
    )

    result = await db.execute(stmt)
    rows = result.all()

    if not rows:
        return {"message": "No participants found for live event"}

    # 3. Response
    return [
        {
            "pid": r.pid,
            "name": r.participant_name,
            "role": r.role,
            "team_name": r.team_name,
            "food_preference": r.food_preference,
            "whatsapp_no": r.whatsapp_no,
        }
        for r in rows
    ]


# TEAMS + LEAD + WHATSAPP (ONLY IF EVENT IS LIVE)

async def get_teams_details(db: AsyncSession):

    live_event_stmt = select(Event).where(Event.is_live == 1)
    live_event_result = await db.execute(live_event_stmt)
    live_event = live_event_result.scalars().first()

    if not live_event:
        return {"message": "There is no live events. "}
    stmt = (
        select(
            Team.tid.label("team_id"),
            Team.name.label("team_name"),
            Participant.name.label("lead_name"),
            User.Whatsapp_No.label("whatsapp_no")
        )
        .join(Participant, Participant.pid == Team.created_by)
        .join(User, User.uid == Participant.user_id)
        .where(
            Team.event_id == live_event.eid , Team.registered == True
        )
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [
        {
            "team_id": r.team_id,
            "team_name": r.team_name,
            "lead_name": r.lead_name,
            "whatsapp_no": r.whatsapp_no
        }
        for r in rows
    ]
async def get_attendance_stats(db: AsyncSession):
    below_40_query = select(func.count()).select_from(User).where(User.Overall_Percentage < 40)
    above_40_query = select(func.count()).select_from(User).where(User.Overall_Percentage >= 40)

    below_40_result = await db.execute(below_40_query)
    above_40_result = await db.execute(above_40_query)

    below_40 = below_40_result.scalar()
    above_or_equal_40 = above_40_result.scalar()

    return {
        "below_40": below_40,
        "above_or_equal_40": above_or_equal_40
    }