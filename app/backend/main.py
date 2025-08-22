from datetime import timedelta

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.backend.api.questions import router as questions_router
from app.backend.utils import get_password_hash, save_upload_file
from app.backend.utils import create_tables, save_upload_file

from app.backend import database, models, schema, security
from app.backend.utils import save_upload_file

# create tables
create_tables()

app = FastAPI()
app.include_router(questions_router)


@app.post("/login", response_model=schema.TokenResponse)
async def login(
    user_data: schema.UserLogin,  # Use Pydantic model directly, not Depends()
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
            "message": "Login successful"
        }
    }


@app.post(
    "/signup", status_code=status.HTTP_201_CREATED
)
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

    return {
        "message": "User created successfully"
    }


@app.post(
    "/jobs", response_model=schema.JobResponse, status_code=status.HTTP_201_CREATED
)
def create_job(
    job: schema.JobCreate,
    current_user: models.User = Depends(security.hr_required),
    db: Session = Depends(database.get_db),
):
    db_job = db.query(models.Job).filter(models.Job.job_id == job.job_id).first()
    if db_job:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Job ID already exists"
        )

    new_job = models.Job(**job.model_dump())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return schema.JobResponse(**job.model_dump(), message="Job created successfully")


@app.post(
    "/apply",
    response_model=schema.JobApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def apply_for_job(
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

    # Save resume file and create application
    resume_path = save_upload_file(resume, application.email)

    new_application = models.JobApplication(
        **application.model_dump(), resume_path=resume_path
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return schema.JobApplicationResponse(
        **application.model_dump(),
        id=new_application.id,
        resume_path=resume_path,
        message="Application submitted successfully"
    )
