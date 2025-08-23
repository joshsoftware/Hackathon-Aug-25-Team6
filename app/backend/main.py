import json
from datetime import timedelta

from fastapi import (BackgroundTasks, Depends, FastAPI, File, HTTPException,
                     UploadFile, status)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.backend import database, models, schema, security
from app.backend.api.questions import question_router
from app.backend.api.score import score_router
from app.backend.prompts.prompt import get_prompt
from app.backend.service.parser import parse_file_with_ai
from app.backend.utils import create_tables, save_upload_file

# create tables
create_tables()

app = FastAPI()

# CORS settings for frontend at http://localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(question_router)
app.include_router(score_router)



@app.post("/login", response_model=schema.TokenResponse)
async def login(
    user_data: schema.UserLogin,
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not security.verify_password(
        user_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "message": "Login successful",
        },
    }


@app.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: schema.UserSignup, db: Session = Depends(database.get_db)):
    # check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )

    # create new user
    hashed_pw = security.get_password_hash(user.password)
    new_user = models.User(
        email=user.email, name=user.name, hashed_password=hashed_pw, role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}


@app.post("/jobs", status_code=status.HTTP_201_CREATED)
def create_job(
    job: schema.JobCreate,
    current_user: models.User = Depends(security.hr_required),
    db: Session = Depends(database.get_db),
):
    new_job = models.Job(**job.model_dump(), recruiter_id=current_user.id)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return {"message": "Job created successfully"}


@app.get("/jobs", response_model=list[schema.JobResponse])
def get_jobs(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(database.get_db),
):
    if current_user.role == schema.UserRole.HR:
        # HR sees only their posted jobs
        jobs = db.query(models.Job)\
            .filter(models.Job.recruiter_id == current_user.id)\
            .all()
    else:
        # Candidates see all jobs
        jobs = db.query(models.Job).all()
    
    return jobs


@app.get("/my-applications/count")
def get_my_applications_count(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(database.get_db),
):
    applied_jobs_count = (
        db.query(models.JobApplication)
        .filter(models.JobApplication.email == current_user.email)
        .count()
    )

    return {"total_applications": applied_jobs_count, "email": current_user.email}


@app.post(
    "/apply",
    response_model=schema.JobApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def apply_for_job(
    background_tasks: BackgroundTasks,
    application: schema.JobApplicationCreate = Depends(),
    resume: UploadFile = File(...),
    current_user: models.User = Depends(security.candidate_required),
    db: Session = Depends(database.get_db),
):
    # Check if job exists
    job = db.query(models.Job).filter(models.Job.job_id == application.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )

    # Save resume file
    resume_path = save_upload_file(resume, application.email)

    # Create application with parsed_resume set to None (will be filled by background task)
    new_application = models.JobApplication(
        **application.model_dump(), resume_path=resume_path, parsed_resume=None
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    # Schedule background task to parse resume
    background_tasks.add_task(
        process_resume_in_background, new_application.id, resume_path
    )

    return schema.JobApplicationResponse(
        **application.model_dump(),
        id=new_application.id,
        resume_path=resume_path,
        parsed_resume=None,
        message="Application submitted successfully. Resume parsing in background",
    )


def process_resume_in_background(application_id: int, resume_path: str) -> None:
    """Background task to parse resume and update the JobApplication record."""
    db_session = database.SessionLocal()
    try:
        try:
            prompt = get_prompt("parse_resume")
            result = (
                parse_file_with_ai(resume_path, prompt)
                if prompt
                else {"error": "Missing parse_resume prompt"}
            )
        except Exception as e:
            result = {"error": f"Failed to parse resume: {str(e)}"}

        app_obj = (
            db_session.query(models.JobApplication)
            .filter(models.JobApplication.id == application_id)
            .first()
        )
        if app_obj:
            app_obj.parsed_resume = result
            db_session.commit()
    finally:
        db_session.close()
