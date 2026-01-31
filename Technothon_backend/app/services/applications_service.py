from ast import stmt
from pydoc import text
from unittest import result
from app.database import get_sql_session
import db
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,func

from app.models.Application_models import Application
from app.models.Job_models import Job
from app.models.Users_models import User
from app.models.Domain_models import Domain
from app.models.auth_models import DomainSelect
from datetime import datetime
import random


CATEGORY_CODES = {
    "Management": "MG",
    "Marketing": "MK",
    "Videography": "VG",
    "Designing": "DS",
    "Decoration": "DC",
    "Anchoring": "AN",
    "Frontend": "FE",
    "Backend": "BE",
}

class ApplicationsService:

    @staticmethod
    def generate_application_id(domain_name: str) -> str:
        """
        Generates ID in format:
        TECH-{CategoryCode}-{Year}-{4-digit}
        """
        year = datetime.now().year
        code = CATEGORY_CODES.get(domain_name, "OT")  # OT = Other
        num = f"{random.randint(0, 9999):04d}"

        return f"TECH-{code}-{year}-{num}"


    @staticmethod
    async def apply_for_job(db: AsyncSession, uid: str, job_name: str,resume_link:str,github_link:str ,skills:str, experience:str,reason_for_applying:str=None):

        # Check if user Exists
        user_check = await db.execute(select(User).where(User.uid == uid))
        user = user_check.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if Job exists
        job_result = await db.execute(select(Job).where(Job.job_title == job_name))
        job = job_result.scalar_one_or_none()

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Check if already applied
        apply =await db.execute(select(Application).where(Application.user_id == uid,Application.job_id == job.job_id))
        applied = apply.scalar_one_or_none()

        if applied:
            raise HTTPException(status_code=404, detail="Job already applied")

        domain_response = await db.execute(select(Domain).where(Domain.domain_id == job.domain_id))
        domain = domain_response.scalar_one_or_none()

        if not domain:
            raise HTTPException(status_code=404, detail="Domain not found")

        domain_name  = domain.domain_name

        # Generate Custom application ID
        application_id = ApplicationsService.generate_application_id(domain_name)

        new_application = Application(
            application_id=application_id,
            user_id=uid,
            domain_id=job.domain_id,
            job_id=job.job_id,

            full_name=user.Name,
            academic_batch=user.Batch,
            student_id=user.Student_ID,
            phone_number=user.Phone_No,
            email_address=user.email,
            resume_link=resume_link,
            github_link=github_link,

            skills=skills,
            experience=experience,
            reason=reason_for_applying,
            applied_at=datetime.now(),
        )

        db.add(new_application)

        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=400, detail=str(e))


        return{
            "status":"success",
            "application_id": application_id,
            "job_id": job.job_id,
        }

    @staticmethod
    async def get_applications_by_domain_name(db: AsyncSession, domain_name: str):

        domain_result = await db.execute(
            select(Domain).where(Domain.domain_name == domain_name)
        )
        domain = domain_result.scalar_one_or_none()

        if not domain:
            raise HTTPException(status_code=404, detail="Domain not found")

        result = await db.execute(
            select(Application).where(Application.domain_id == domain.domain_id)
        )

        return result.scalars().all()

    @staticmethod
    async def get_applications_per_domain(db: AsyncSession):
        stmt = (
            select(
                Domain.domain_id,
                Domain.domain_name,
                func.count(Application.application_id).label("application_count")
            )
            .outerjoin(
                Application,
                Domain.domain_id == Application.domain_id
            )
            .group_by(
                Domain.domain_id,
                Domain.domain_name
            )
        )

        result = await db.execute(stmt)
        rows = result.all()

        return [
            {
                "domain_id": domain_id,
                "domain_name": domain_name,
                "application_count": count
            }
            for domain_id, domain_name, count in rows
        ]

    @staticmethod
    async def get_all_domains(db: AsyncSession):
        result = await db.execute(select(Domain))
        domains = result.scalars().all()
        return [
            {
                "domain_id": d.domain_id,
                "domain_name": d.domain_name
            }
            for d in domains
        ]
    @staticmethod
    async def select_domain(
    db: AsyncSession,
    domain_id: str
):
        result = await db.execute(
            select(Domain.domain_id, Domain.domain_name)
            .where(Domain.domain_id == domain_id)
        )

        domain = result.first()

        if not domain:
            raise HTTPException(status_code=404, detail="Domain not found")

        applicants= await db.execute(
            select(Application)
            .where(Application.domain_id == domain_id)
        )
        applications = applicants.scalars().all()
        if not applications:
            raise HTTPException(status_code=404, detail="No applications found for this domain")
        return {
            "domain_id": domain.domain_id,
            "domain_name": domain.domain_name,
            "applications": [
                {
                    "application_id": app.application_id,
                    "user_id": app.user_id,
                    "job_id": app.job_id,
                    "full_name": app.full_name,
                    "academic_batch": app.academic_batch,
                    "student_id": app.student_id,
                    "phone_number": app.phone_number,
                    "email_address": app.email_address,
                    "resume_link": app.resume_link,
                    "github_link": app.github_link,
                    "skills": app.skills,
                    "experience": app.experience,
                    "reason": app.reason,
                    "applied_at": app.applied_at,
                }
                for app in applications
            ]
        }