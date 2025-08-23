from ast import Dict
import os
import uuid
import json
from fastapi.middleware.cors import CORSMiddleware

from datetime import datetime, timedelta
from typing import Dict, List, Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status, BackgroundTasks

from sqlalchemy import func
from sqlalchemy.orm import Session

# Import the new Anthropic integration
from app.backend.anthropic_integration import AnthropicInterviewGenerator, check_anthropic_status, get_recommended_models

from app.backend import database, models, schema, security
from app.backend.api.questions import question_router
from app.backend.api.users import user_router
# from app.backend.api.questions_score import question_score_router
from app.backend.utils import create_tables, save_upload_file
from app.backend.service.parser import parse_file_with_ai
from app.backend.prompts.prompt import get_prompt
from app.backend.schema import (
    ResumeData,
    JobDescriptionData,
    InterviewSession,
    StartInterviewRequest,
    StartInterviewResponse,
    AnswerQuestionRequest,
    AnswerQuestionResponse,
    EndInterviewRequest,
    InterviewSessionResponse,
    QuestionResponse
)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

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
app.include_router(user_router)

DATABASE_URL = os.getenv("DATABASE_URL")


# Initialize Anthropic Claude
def initialize_anthropic():
    """Initialize Anthropic Claude with error handling"""
    
    try:
        # Get configuration from environment
        model_name = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")
        
        # Initialize the generator
        generator = AnthropicInterviewGenerator(model=model_name)
        print(f"✅ Successfully initialized Claude with model: {model_name}")
        return generator
        
    except Exception as e:
        print(f"❌ Failed to initialize Claude: {e}")
        print("💡 Make sure to:")
        print("   1. Set ANTHROPIC_API_KEY in .env file")
        print("   2. Get API key from: https://console.anthropic.com/")
        print("   3. Ensure you have sufficient credits")
        return None

# Try to initialize Claude
question_generator = initialize_anthropic()

# Fallback generator for when Claude is not available
class FallbackQuestionGenerator:
    """Simple fallback when Claude is not available"""
    
    def generate_initial_questions(self, resume_data: ResumeData, jd_data: JobDescriptionData) -> List[str]:
        """Generate basic questions based on skills analysis"""
        
        questions = []
        
        # Analyze skills
        candidate_skills = set(skill.lower() for skill in resume_data.primary_skills + resume_data.secondary_skills)
        required_skills = set(skill.lower() for skill in jd_data.skills.must_have)
        
        matching_skills = candidate_skills.intersection(required_skills)
        missing_skills = required_skills - candidate_skills
        
        # Question 1: About matching skills or background
        if matching_skills:
            skill = list(matching_skills)[0]
            questions.append(f"I see you have experience with {skill}. Can you tell me about a specific project where you used it effectively?")
        else:
            questions.append(f"Tell me about your background in {resume_data.domain_expertise[0] if resume_data.domain_expertise else 'your field'} and how it relates to this role.")
        
        # Question 2: About learning new skills
        if missing_skills:
            skill = list(missing_skills)[0]
            questions.append(f"This role requires {skill}, which wasn't in your background. How do you typically approach learning new technologies?")
        else:
            questions.append("How do you stay updated with the latest technologies in your field?")
        
        # Question 3: Problem solving
        questions.append("Describe a challenging technical problem you've encountered recently and walk me through how you solved it.")
        
        # Question 4: Role-specific
        if jd_data.responsibilities:
            questions.append(f"One of the key responsibilities is '{jd_data.responsibilities[0][:100]}...'. How would you approach this?")
        else:
            questions.append(f"What interests you most about working at {jd_data.company} in this role?")
        
        return questions
    
    def generate_followup_question(self, session: InterviewSession, current_question: str, candidate_answer: str) -> Optional[str]:
        """Generate simple follow-up questions"""
        
        answer_length = len(candidate_answer.split())
        answer_lower = candidate_answer.lower()
        
        # If answer is too short
        if answer_length < 15:
            return "Can you provide more details or give a specific example?"
        
        # If they mention a project
        if "project" in answer_lower and "role" not in current_question.lower():
            return "What was your specific role in that project and what challenges did you face?"
        
        # If they mention learning
        if any(word in answer_lower for word in ["learn", "study", "research"]):
            return "How long did it take you to become proficient, and what resources did you find most helpful?"
        
        # If they mention problems/challenges
        if any(word in answer_lower for word in ["problem", "challenge", "issue", "difficult"]):
            return "What would you do differently if you faced a similar situation again?"
        
        # If we've asked enough questions (5+)
        if len(session.question_responses) >= 5:
            return None
        
        # Ask about different required skills
        covered_skills = set()
        for qa in session.question_responses:
            for skill in session.jd_data.skills.must_have:
                if skill.lower() in qa.question.lower() or skill.lower() in qa.answer.lower():
                    covered_skills.add(skill.lower())
        
        uncovered_skills = [skill for skill in session.jd_data.skills.must_have 
                          if skill.lower() not in covered_skills]
        
        if uncovered_skills:
            return f"Tell me about your experience or thoughts on {uncovered_skills[0]}."
        
        return None
    
    def get_model_info(self):
        return {
            "model_name": "fallback",
            "status": "active",
            "type": "rule_based",
            "capabilities": ["basic_questions", "simple_followups"]
        }

# Use fallback if Claude failed to initialize
if question_generator is None:
    question_generator = FallbackQuestionGenerator()
    print("⚠️  Using fallback question generator")

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
    # Convert job data to dict and add recruiter_id
    job_data = job.model_dump()
    job_data["recruiter_id"] = current_user.id

    # Create new job with recruiter_id
    new_job = models.Job(**job_data)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return {"message": "Job created successfully"}

@app.get("/jobs", response_model=list[schema.JobResponse])
def get_jobs(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(database.get_db),
):
    base_query = (
        db.query(
            models.Job,
            models.User.name.label("recruiter_name"),
            func.count(models.JobApplication.id).label(
                "applications_count"
            ),  # Changed from db.func to func
        )
        .join(models.User, models.Job.recruiter_id == models.User.id)
        .outerjoin(
            models.JobApplication, models.Job.job_id == models.JobApplication.job_id
        )
        .group_by(models.Job.job_id, models.User.name)
    )

    if current_user.role == schema.UserRole.HR:
        # HR sees only their posted jobs
        jobs = base_query.filter(models.Job.recruiter_id == current_user.id).all()
    else:
        # Candidates see all jobs
        jobs = base_query.all()
    # Convert the result to a list of dictionaries
    job_list = []
    for job, recruiter_name, applications_count in jobs:
        job_dict = {
            "job_id": job.job_id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "experience": job.experience,
            "job_overview": job.job_overview,
            "key_responsibilities": job.key_responsibilities,
            "must_have_skills": job.must_have_skills,
            "good_to_have_skills": job.good_to_have_skills,
            "recruiter_id": job.recruiter_id,
            "recruiter_name": recruiter_name,
            "job_type": job.job_type,
            "applications_count": applications_count,
            "posted_date": job.posted_date,
        }
        job_list.append(job_dict)

    return job_list

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

    # Save resume file and create application
    resume_path = save_upload_file(resume, application.email)
    # Create application with parsed_resume set to None (will be filled by background task)
    new_application = models.JobApplication(
        **application.model_dump(), resume_path=resume_path, parsed_resume=None
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    # Schedule background task to parse resume
    background_tasks.add_task(process_resume_in_background, new_application.id, resume_path)
    return schema.JobApplicationResponse(
        **application.model_dump(),
        id=new_application.id,
        resume_path=resume_path,
        parsed_resume=None,
        message="Application submitted successfully. Resume parsing in background"
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

# In-memory storage for interview sessions (use database in production)
interview_sessions: Dict[str, InterviewSession] = {}

@app.post("/start-interview", response_model=StartInterviewResponse)
async def start_interview(request: StartInterviewRequest):
    """Start a new interview session"""
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Generate initial questions
        initial_questions = question_generator.generate_initial_questions(
            request.resume_data, 
            request.jd_data
        )
        
        # Ensure we have at least one question
        if not initial_questions:
            initial_questions = ["Tell me about your background and what interests you about this role."]
        
        # Create interview session
        session = InterviewSession(
            session_id=session_id,
            resume_data=request.resume_data,
            jd_data=request.jd_data,
            current_question_index=0,
            questions=initial_questions,
            question_responses=[],
            status="active",
            created_at=datetime.now()
        )
        
        # Store session
        interview_sessions[session_id] = session
        
        return StartInterviewResponse(
            session_id=session_id,
            first_question=initial_questions[0],
            total_initial_questions=len(initial_questions)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting interview: {str(e)}")

@app.post("/answer-question", response_model=AnswerQuestionResponse)
async def answer_question(request: AnswerQuestionRequest):
    """Submit answer and get next question"""
    try:
        # Get session
        session = interview_sessions.get(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found")
        
        if session.status != "active":
            raise HTTPException(status_code=400, detail="Interview session is not active")
        
        # Get current question
        current_question = session.questions[session.current_question_index]
        
        # Store the Q&A
        qa_response = schema.QuestionResponse(
            question=current_question,
            answer=request.answer,
            timestamp=datetime.now()
        )
        session.question_responses.append(qa_response)
        
        # Determine next question
        next_question = None
        is_complete = False
        
        # Check if we have more pre-generated questions
        if session.current_question_index + 1 < len(session.questions):
            session.current_question_index += 1
            next_question = session.questions[session.current_question_index]
        else:
            # Generate dynamic follow-up question
            try:
                followup = question_generator.generate_followup_question(
                    session, current_question, request.answer
                )
                
                if followup:
                    session.questions.append(followup)
                    session.current_question_index += 1
                    next_question = followup
                else:
                    # End interview
                    session.status = "completed"
                    is_complete = True
                    
            except Exception as e:
                print(f"Error generating follow-up: {e}")
                # End interview gracefully if we can't generate more questions
                session.status = "completed"
                is_complete = True
        
        return AnswerQuestionResponse(
            next_question=next_question,
            is_interview_complete=is_complete,
            question_number=len(session.question_responses),
            session_status=session.status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing answer: {str(e)}")

@app.get("/session/{session_id}", response_model=InterviewSessionResponse)
async def get_session(session_id: str):
    """Get interview session details"""
    session = interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    return InterviewSessionResponse(
        session_id=session.session_id,
        status=session.status,
        total_questions=len(session.question_responses),
        created_at=session.created_at,
        candidate_name=f"{session.resume_data.candidate_first_name} {session.resume_data.candidate_last_name}",
        company=session.jd_data.company,
        question_responses=session.question_responses
    )

@app.post("/end-interview")
async def end_interview(request: EndInterviewRequest):
    """End interview session manually"""
    session = interview_sessions.get(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    session.status = "ended"
    return {"message": "Interview ended successfully", "session_id": request.session_id}

@app.get("/sessions")
async def list_sessions():
    """List all interview sessions"""
    sessions_summary = []
    for session_id, session in interview_sessions.items():
        sessions_summary.append({
            "session_id": session_id,
            "candidate_name": f"{session.resume_data.candidate_first_name} {session.resume_data.candidate_last_name}",
            "company": session.jd_data.company,
            "status": session.status,
            "questions_count": len(session.question_responses),
            "created_at": session.created_at
        })
    
    return {"sessions": sessions_summary}

# Claude-specific endpoints

@app.get("/claude/status")
async def claude_status():
    """Check Claude API status"""
    return check_anthropic_status()

@app.get("/claude/models")
async def claude_models():
    """Get recommended Claude models for interviews"""
    return {
        "recommended_models": get_recommended_models(),
        "current_status": check_anthropic_status()
    }

@app.get("/claude/model-info")
async def current_model_info():
    """Get current model information"""
    if hasattr(question_generator, 'get_model_info'):
        return question_generator.get_model_info()
    else:
        return {"model": "fallback", "status": "no_claude"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_info = await current_model_info()
    claude_status_info = check_anthropic_status()
    
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "claude_status": claude_status_info["status"],
        "current_model": model_info,
        "version": "1.0.0"
    }

@app.get("/jobs/{job_id}")
def get_jobs(
    job_id: int,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(database.get_db),
):
    job =  db.query(
            models.Job,
        ).filter(models.Job.job_id == job_id).first()
    
    return job
        
if __name__ == "__main__":
    import uvicorn
    print("�� Starting Interview Question Generator with Claude")
    print("�� Health check: http://localhost:8000/health")
    print("📚 API docs: http://localhost:8000/docs")
    print("🔧 Claude status: http://localhost:8000/claude/status")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)