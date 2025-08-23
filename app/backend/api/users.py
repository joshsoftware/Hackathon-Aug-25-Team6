from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend import database, models, schema
from app.backend.service.question_analysis import QuestionAnalysisService

user_router = APIRouter()

@user_router.get("/users", response_model=list[schema.UserResponse])
async def get_users(db: Session = Depends(database.get_db)):
    users = db.query(models.User).all()
    return [schema.UserResponse(id=user.id, email=user.email, name=user.name, role=user.role, message="User retrieved successfully") for user in users]

# @user_router.get("/applicants", response_model=list[schema.UserResponse])
# async def get_applicants(db: Session = Depends(database.get_db)):
#     job_applications = db.query(models.JobApplication).first()
#     if not job_applications:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job Applications not found")
    
#     # Get applications for this job
#     applications = db.query(models.JobApplication).all()

#     # Get unique user emails from applications
#     applicant_emails = [app.email for app in applications]

#     # Find users with these emails
#     users = db.query(models.User).filter(models.User.email.in_(applicant_emails)).all()

#     return [schema.UserResponse(id=user.id, email=user.email, name=user.name, role=user.role, message="Applicant retrieved successfully") for user in users]


@user_router.get("/applicants")
async def get_unique_users_with_job_details(db: Session = Depends(database.get_db)):
    # Get unique users based on name and email
    unique_users = db.query(models.User).all()
    
    result = []
    for user in unique_users:
        # Find all job applications for users with matching email
        applications = (
            db.query(models.JobApplication)
            .filter(models.JobApplication.email == user.email)
            .all()
        )
        
        job_details = []
        for application in applications:
            # Get the job details for each application
            job = db.query(models.Job).filter(models.Job.job_id == application.job_id).first()
            
            if job:
                # Count number of applications for this job
                application_count = (
                    db.query(func.count(models.JobApplication.id))
                    .filter(models.JobApplication.job_id == job.job_id)
                    .scalar()
                )
                
                # Get the recruiter name
                recruiter = db.query(models.User).filter(models.User.id == job.recruiter_id).first()
                recruiter_name = recruiter.name if recruiter else "Unknown"
                
                # Create a dictionary with job details and application info
                job_detail = {
                    "application_id": application.id,
                    "job_id": job.job_id,
                    "job_title": job.title,
                    "company": job.company,
                    "location": job.location,
                    "experience": job.experience,
                    "job_overview": job.job_overview,
                    "key_responsibilities": job.key_responsibilities,
                    "must_have_skills": job.must_have_skills,
                    "good_to_have_skills": job.good_to_have_skills,
                    "job_type": job.job_type,
                    "recruiter_name": recruiter_name,
                    "total_applications": application_count,
                    "posted_date": job.posted_date
                }
                job_details.append(job_detail)
        
        # Add user with job details to result
        user_detail = dict(
            user_id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            job_applications=job_details
        )
        result.append(user_detail)
    
    return result
