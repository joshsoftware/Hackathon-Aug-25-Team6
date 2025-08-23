from datetime import datetime
from enum import Enum
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Skills(str, Enum):
    # Add your specific skills here - these are examples
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    REACT = "react"
    NODE_JS = "nodejs"
    SQL = "sql"
    MACHINE_LEARNING = "machine_learning"
    DATA_ANALYSIS = "data_analysis"
    PROJECT_MANAGEMENT = "project_management"
    # Add more skills as needed

class ExperienceRequired(str, Enum):
    ENTRY_LEVEL = "0-2 years"
    MID_LEVEL = "3-5 years"
    SENIOR_LEVEL = "6-10 years"
    EXPERT_LEVEL = "10+ years"

class UserRole(str, Enum):
    CANDIDATE = "candidate"
    HR = "hr"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserSignup(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: UserRole

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: UserRole
    message: str

    class Config:
        from_attributes = True

class JobCreate(BaseModel):
    location: str
    experience: str
    job_overview: str
    key_responsibilities: str
    required_skills: str
    must_have_skills: str
    good_to_have_skills: Optional[str] = None
    job_type: str

class JobResponse(BaseModel):
    job_id: int
    title: str
    company: str
    location: str
    experience: str
    job_overview: str
    key_responsibilities: str
<<<<<<< HEAD
    required_skills: str
    qualifications: str
    good_to_have_skills: Optional[str] = None
=======
    must_have_skills: str
    good_to_have_skills: Optional[str] = None
    recruiter_id: int
    job_type: str
    recruiter_name: str
    applications_count: int
    posted_date: datetime
>>>>>>> f44de8b9738798965b8b9ff63c0bf0efd0f08a91

    class Config:
        from_attributes = True

class JobApplicationCreate(BaseModel):
    job_id: int
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: EmailStr
    experience_years: int = Field(..., ge=0, le=50)
    experience_months: int = Field(..., ge=0, le=11)
    current_city: str
    gender: Gender

class JobApplicationResponse(BaseModel):
    id: int
    job_id: int
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: EmailStr
    experience_years: int
    experience_months: int
    current_city: str
    gender: Gender
    resume_path: str
    message: str

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    text: str
    tags: Optional[str] = None

class QuestionResponse(BaseModel):
    id: int
    text: str
    tags: Optional[str] = None
    message: str

    class Config:
        from_attributes = True

class QuestionAnswerCreate(BaseModel):
    question_id: int
    candidate_id: int
    resume_path: str
    jd_path: str
    answer: str

class QuestionAnswerResponse(BaseModel):
    id: int
    question_id: int
    candidate_id: int
    resume_path: str
    jd_path: str
    answer: str
    message: str

    class Config:
        from_attributes = True

class QuestionScoreCreate(BaseModel):
    application_id: int
    candidate_id: int
    question_id: int
    technical_correctness: int
    specificity_depth: int
    reasoning_quality: int
    real_world_signals: int
    communication: int
    final_score: int
    verdict: str
    improvement_tips: Optional[str] = None

class QuestionScoreResponse(BaseModel):
    id: int
    application_id: int
    candidate_id: int
    question_id: int
    technical_correctness: int
    specificity_depth: int
    reasoning_quality: int
    real_world_signals: int
    communication: int
    final_score: int
    verdict: str
    improvement_tips: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# NEW: Interview-related models
class SkillsData(BaseModel):
    must_have: List[str]
    nice_to_have: Optional[List[str]] = None

class ExperienceRequiredData(BaseModel):
    min_years: int
    max_years: Optional[int] = None

class JobDescriptionData(BaseModel):
    company: str
    skills: SkillsData
    experience_required: ExperienceRequiredData
    responsibilities: List[str]

class ResumeData(BaseModel):
    candidate_first_name: str
    candidate_last_name: str
    primary_skills: List[str]
    secondary_skills: List[str]
    domain_expertise: List[str]

# NEW: Interview session models
class QuestionResponse(BaseModel):
    question: str
    answer: str
    timestamp: datetime

class InterviewSession(BaseModel):
    session_id: str
    resume_data: ResumeData
    jd_data: JobDescriptionData
    current_question_index: int
    questions: List[str]
    question_responses: List[QuestionResponse]
    status: str  # "active", "completed", "ended"
    created_at: datetime

class StartInterviewRequest(BaseModel):
    resume_data: ResumeData
    jd_data: JobDescriptionData

class StartInterviewResponse(BaseModel):
    session_id: str
    first_question: str
    total_initial_questions: int

class AnswerQuestionRequest(BaseModel):
    session_id: str
    answer: str

class AnswerQuestionResponse(BaseModel):
    next_question: Optional[str]
    is_interview_complete: bool
    question_number: int
    session_status: str

class EndInterviewRequest(BaseModel):
    session_id: str

class InterviewSessionResponse(BaseModel):
    session_id: str
    status: str
    total_questions: int
    created_at: datetime
    candidate_name: str
    company: str
    question_responses: List[QuestionResponse]