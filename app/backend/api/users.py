from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend import database, models, schema
from app.backend.service.question_analysis import QuestionAnalysisService

user_router = APIRouter()

@user_router.get("/users", response_model=list[schema.UserResponse])
async def get_users(db: Session = Depends(database.get_db)):
    users = db.query(models.User).all()
    return [schema.UserResponse(id=user.id, email=user.email, name=user.name, role=user.role, message="User retrieved successfully") for user in users]

@user_router.get("/jobs/{job_id}/applicants", response_model=list[schema.UserResponse])
async def get_job_applicants(job_id: int, db: Session = Depends(database.get_db)):
    job = db.query(models.Job).filter(models.Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    # Get applications for this job
    applications = db.query(models.JobApplication).filter(models.JobApplication.job_id == job_id).all()

    # Get unique user emails from applications
    applicant_emails = [app.email for app in applications]

    # Find users with these emails
    users = db.query(models.User).filter(models.User.email.in_(applicant_emails)).all()

    return [schema.UserResponse(id=user.id, email=user.email, name=user.name, role=user.role, message="Applicant retrieved successfully") for user in users]
