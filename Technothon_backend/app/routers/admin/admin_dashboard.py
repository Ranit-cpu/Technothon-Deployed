# admin_dashboard.py
from fastapi import APIRouter, Request, HTTPException, Depends,UploadFile, File
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete, outerjoin, extract,func
from app.models.team_models import Team
from app.models.admin_models import Admin
from app.models.payment_models import Payment
from app.models.Users_models import User
from app.models.participant_models import Participant
from app.database import get_sql_session, get_sqlite_session
from app.services.admin_service import get_participants_details, get_teams_details, get_attendance_stats
from app.services.applications_service import ApplicationsService
from app.models.auth_models import DomainSelect
from app.models.Application_models import Application
from app.models.Students_models import Student
from app.models.event_models import Event
from app.models.auth_models import UpdateLiveStatusRequest
from app.models.food_models import Food
import csv
import io

router = APIRouter(prefix="/admin", tags=["admin"])


async def get_current_admin_id(request: Request):
    """Verify session and return admin ID"""
    admin_id = request.session.get("admin_id")
    role = request.session.get("role")

    if not admin_id or role != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please login as admin.",
        )

    return admin_id


async def verify_admin_exists(admin_id: str, db: AsyncSession):
    """Verify that the admin exists in database"""
    result = await db.execute(select(Admin).where(Admin.admin_id == admin_id))
    admin = result.scalar_one_or_none()
    if not admin:
        raise HTTPException(status_code=403, detail="Admin not found")
    return admin


@router.get("/profile")
async def get_admin_profile(
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """Get admin profile information"""
    admin_id = await get_current_admin_id(request)
    admin = await verify_admin_exists(admin_id, db)
    return {
        "name": admin.username,
        "role": admin.role
    }


@router.get("/charts_data")
async def get_charts_data(
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """Get data for dashboard charts"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    # Example data - replace with actual queries
    return {
        "users": [150, 50],  # Active, Inactive
        "sponsors": [10, 5],  # Current, Past
        "teams": [25, 75]  # Pending, Approved
    }


@router.get("/gallery_data")
async def get_gallery_data(
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """Get gallery statistics"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    return {
        "eventName": "Technothon 2024",
        "uploads": 42
    }


@router.get("/uploads")
async def get_uploads(
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """Get list of uploaded files"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    # Replace with actual file listing logic
    return {
        "files": ["file1.pdf", "file2.xlsx", "file3.png"]
    }


@router.get("")
async def admin_dashboard(
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """Main admin dashboard endpoint"""
    admin_id = await get_current_admin_id(request)
    admin = await verify_admin_exists(admin_id, db)

    # Fetch all participants
    result = await db.execute(select(Participant))
    participants = result.scalars().all()

    # Exclude passwords
    participant_data = [
        {
            "id": p.id,
            "name": p.name,
            "email": p.email,
            "created_at": p.created_at
        }
        for p in participants
    ]

    return {
        "status": "success",
        "admin_id": admin.admin_id,
        "participants": participant_data
    }


@router.get("/payments")
async def view_pending_payments(
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """View all pending payments"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    result = await db.execute(select(Payment).where(Payment.status == "PENDING"))
    payments = result.scalars().all()
    return {"payments": payments}


@router.get("/pending_teams")
async def get_registered_teams(
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """Get teams pending approval"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    result = await db.execute(
        select(
            Team.tid.label("tid"),
            Team.name.label("team_name"),
            Team.transaction_id.label("transaction_id"),
            Participant.name.label("lead_name"),
        )
        .select_from(
            outerjoin(Team, Participant, Participant.pid == Team.created_by)
        )
        .where(Team.registered == 0)
    )

    teams = result.mappings().all()

    return {"pending_teams": teams}


@router.post("/approve_team/{team_id}")
async def approve_team(
        team_id: str,
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """Approve a team registration + mark payment SUCCESS"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    # Fetch team
    result = await db.execute(select(Team).where(Team.tid == team_id))
    team = result.scalar_one_or_none()

    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")

    if team.registered:
        raise HTTPException(status_code=400, detail="Team is already approved")

    # ✅ 1. Approve team
    await db.execute(
        update(Team)
        .where(Team.tid == team_id)
        .values(registered=1)
    )

    # ✅ 2. Update payment status to SUCCESS
    if team.transaction_id:
        await db.execute(
            update(Payment)
            .where(Payment.transaction_id == team.transaction_id)
            .values(status="SUCCESS")
        )

    # ✅ 3. Enable food for participants
    participants_result = await db.execute(
        select(Participant).where(Participant.team_id == team_id)
    )
    participants = participants_result.scalars().all()

    for p in participants:
        await db.execute(
            update(Food)
            .where(Food.pid == p.pid)
            .values(flag=1)
        )

    await db.commit()

    return {
        "message": f"Team '{team.name}' approved successfully",
        "team_id": team.tid,
        "payment_status": "SUCCESS"
    }



@router.post("/reject_team/{tid}")
async def reject_team(
        tid: str,
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """Reject and delete a team"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    result = await db.execute(select(Team).where(Team.tid == tid))
    team = result.scalar_one_or_none()

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    await db.execute(delete(Team).where(Team.tid == tid))
    await db.commit()
    return {"message": f"Team '{team.name}' rejected and deleted."}


@router.get("/teams")
async def get_all_teams(
        request: Request,
        db: AsyncSession = Depends(get_sql_session)
):
    """Get all teams with their members"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    return await get_teams_details(db)


@router.get("/participants/details")
async def participants_details(
    db: AsyncSession = Depends(get_sql_session)
):
    return await get_participants_details(db)

@router.get("/attendance-stats")
async def attendance_stats(
    request: Request,
    db: AsyncSession = Depends(get_sql_session)
):
    """Get attendance statistics for the live event"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    return await get_attendance_stats(db)

@router.get("/applications_per_domain")
async def applications_per_domain(
    request: Request,
    db: AsyncSession = Depends(get_sql_session)
):
    """Get number of applications per domain"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    return await ApplicationsService.get_applications_per_domain(db)

@router.get("/all_domains")
async def all_domains(
    request: Request,
    db: AsyncSession = Depends(get_sql_session)
):
    """Get all domains"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    return await ApplicationsService.get_all_domains(db)

@router.get("/applications_by_domain_id/{domain_id}")
async def applications_by_domain_id(
    domain_id: str,   # 👈 path variable
    request: Request,
    db: AsyncSession = Depends(get_sql_session)
):
    """Get applications by domain id"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    return await ApplicationsService.select_domain(db, domain_id)


@router.get("/stats/student-participation")
async def student_participation_stats(
    request: Request,
    db: AsyncSession = Depends(get_sql_session)
):
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    result = await db.execute(
        select(
            extract("year", Team.created_at).label("year"),
            func.count(Participant.pid).label("count")
        )
        .join(Participant, Participant.team_id == Team.tid)
        .group_by("year")
        .order_by("year")
    )

    return [
        {"year": int(row.year), "count": row.count}
        for row in result.all()
    ]

@router.get("/getAllUsers")
async def get_all_users(
    request: Request,
    db: AsyncSession = Depends(get_sql_session)
):
    """Get all users"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    result = await db.execute(select(User))
    users = result.scalars().all()

    user_data = [
        {
            "id": user.Student_ID,
            "name": user.Name,
            "class": user.Batch,
            "whatsapp_no": user.Whatsapp_No,
            "user_id": user.uid,
            "attendance_percentage": user.Overall_Percentage or 0,
        }
        for user in users
    ]

    return {"users": user_data}

@router.get("/applications/count")
async def total_applications_count(
    request: Request,
    db: AsyncSession = Depends(get_sql_session)
):
    """Get total number of applications and current live event"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    # ✅ OPTIMIZED: Count total registered applications
    result = await db.execute(
        select(func.count())
        .select_from(Participant)
        .join(Team, Team.tid == Participant.team_id)
        .where(Team.registered == True)
    )
    total_count = result.scalar_one()

    # ✅ OPTIMIZED: Get the current live event directly
    live_event_result = await db.execute(
        select(Event)
        .where(Event.is_live == 1)
        .order_by(Event.eid.desc())  # Get most recent if multiple
        .limit(1)
    )
    live_event = live_event_result.scalar_one_or_none()

    if live_event:
        event_name = live_event.name
    else:
        # Fallback: Try to get event from registered teams
        team_event_result = await db.execute(
            select(Event)
            .join(Team, Team.event_id == Event.eid)
            .where(Team.registered == True)
            .limit(1)
        )
        team_event = team_event_result.scalar_one_or_none()
        event_name = team_event.name if team_event else "No active event"

    return {
        "total_applications": total_count,
        "event_name": event_name
    }

@router.get("/users/count")
async def total_users_count(
    request: Request,
    db: AsyncSession = Depends(get_sql_session)
):
    """Get total number of users"""
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    result = await db.execute(select(func.count()).select_from(User))
    total_count = result.scalar_one()

    return {"total_users": total_count}

@router.get("/getAllEvents")
async def all_events(request: Request, db: AsyncSession = Depends(get_sql_session)):
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    result = await db.execute(select(Event))
    events = result.scalars().all()

    return [
        {
            "event_id": e.eid,
            "event_name": e.name,
            "description": e.description,
            "event_type": e.event_type,
            "start_date": e.start_date,
            "end_date": e.end_date,
            "is_live": bool(e.is_live),
        }
        for e in events
    ]

@router.post("/technothon")
async def upload_and_update_technothon_csv(
    file: UploadFile = File(...),
    sqlite_db: AsyncSession = Depends(get_sqlite_session),   # SQLite session
    mysql_db: AsyncSession = Depends(get_sql_session)        # MySQL session
):

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    try:
        content = await file.read()
        csv_text = content.decode("utf-8")
        csv_reader = csv.reader(io.StringIO(csv_text))

        header = next(csv_reader, None)
        if not header:
            raise HTTPException(status_code=400, detail="CSV is empty")

        inserted = 0
        updated = 0

        for row in csv_reader:
            if len(row) < 4:
                continue

            try:
                student_id = int(row[0])
                name = row[1].strip()
                batch = row[2].strip()
                percentage = float(row[3].strip().replace("%", ""))
            except Exception:
                continue

            # -----------------------------
            # UPDATE IN SQLITE (Students)
            # -----------------------------
            stmt = select(Student).where(Student.Student_ID == student_id)
            result = await sqlite_db.execute(stmt)
            student = result.scalar_one_or_none()

            # -----------------------------
            # UPDATE IN MYSQL (Users)
            # -----------------------------
            stmt2 = select(User).where(User.Student_ID == student_id)
            result2 = await mysql_db.execute(stmt2)
            user = result2.scalar_one_or_none()

            if student:
                # UPDATE existing record in SQLite
                student.Name = name
                student.Batch = batch
                student.Overall_Percentage = percentage

                # UPDATE corresponding record in MySQL
                if user:
                    user.Name = name
                    user.Batch = batch
                    user.Overall_Percentage = percentage

                updated += 1

            else:
                # INSERT into SQLite only
                new_student = Student(
                    Student_ID=student_id,
                    Name=name,
                    Batch=batch,
                    Overall_Percentage=percentage
                )
                sqlite_db.add(new_student)
                inserted += 1

                # Optional: Insert into MySQL if needed
                # Only if you want new entries also in Users table

        # Commit both DBs
        await sqlite_db.commit()
        await mysql_db.commit()

        return {
            "message": "CSV processed successfully",
            "inserted": inserted,
            "updated": updated
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/events/{event_id}/live-status")
async def update_event_live_status(
    event_id: str,
    body: UpdateLiveStatusRequest,  # This is the JSON body, not the HTTP Request
    db: AsyncSession = Depends(get_sql_session)
):
    """
    Update the live status of an event
    """
    # Find the event
    result = await db.execute(select(Event).filter(Event.eid == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Update the live status
    event.is_live = 1 if body.is_live else 0
    await db.commit()
    await db.refresh(event)
    
    return {
        "message": "Event live status updated successfully",
        "event_id": event.eid,
        "is_live": bool(event.is_live)
    }


@router.delete("/events/{event_id}/delete")
async def delete_event(
        event_id: str,
        request: Request,  # This is the JSON body, not the HTTP Request
        db: AsyncSession = Depends(get_sql_session)
):
    """
    Delete an event permanently
    """
    # Verify admin authentication
    admin_id = await get_current_admin_id(request)
    await verify_admin_exists(admin_id, db)

    # Find the event
    result = await db.execute(select(Event).filter(Event.eid == event_id))
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Delete the event
    await db.delete(event)
    await db.commit()

    return {
        "message": "Event deleted successfully",
        "event_id": event_id
    }
