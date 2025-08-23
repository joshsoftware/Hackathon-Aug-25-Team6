import uuid
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta

from minio import Minio
from minio.error import S3Error

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.backend import database, models, schema, security
from app.backend.api.questions import question_router
from app.backend.api.questions_score import question_score_router
from app.backend.utils import create_tables, save_upload_file, upload_file_to_minio
from fastapi.middleware.cors import CORSMiddleware

# create tables
create_tables()

app = FastAPI()

# MinIO setup
minio_client = Minio(
    "localhost:9000",  # MinIO server
    access_key="minioadmin",
    secret_key="minioadmin",
    secure=False  # False for HTTP
)

MINIO_BUCKET = "pdf-files"

# Ensure bucket exists
if not minio_client.bucket_exists(MINIO_BUCKET):
    minio_client.make_bucket(MINIO_BUCKET)


# CORS settings for frontend at http://localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(question_router)
app.include_router(question_score_router)

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
    new_job = models.Job(**job.model_dump())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return {"message": "Job created successfully"}

@app.get("/jobs", response_model=list[schema.JobResponse])
def get_jobs(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(database.get_db),
):
    jobs = db.query(models.Job).all()
    return jobs


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

@app.post("/upload/")
async def upload_pdf(resume: UploadFile = File(...)):
    file_url = upload_file_to_minio(resume, MINIO_BUCKET, minio_client)
    return {"file_url": file_url, "message": "File uploaded successfully"}

