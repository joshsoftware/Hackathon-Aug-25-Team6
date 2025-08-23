from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


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


class JobCreate(
    BaseModel
):  # add job title, company, job type, application deadline, status
    location: str
    experience: str
    job_overview: str
    key_responsibilities: str
    required_skills: str
    qualifications: str
    good_to_have_skills: Optional[str] = None


class JobResponse(BaseModel):
    job_id: int
    location: str
    experience: str
    job_overview: str
    key_responsibilities: str
    required_skills: str
    qualifications: str
    good_to_have_skills: Optional[str] = None

    class Config:
        from_attributes = True


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class JobApplicationCreate(BaseModel):
    job_id: int
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: EmailStr
    experience_years: int = Field(..., ge=0, le=50)  # Validation for reasonable years
    experience_months: int = Field(..., ge=0, le=11)  # Validation for months
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


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class QuestionScoreBatchResult(BaseModel):
    question_id: int
    score: int
    verdict: str
    message: str


class QuestionScoreBatchResponse(BaseModel):
    results: list[QuestionScoreBatchResult]

    class Config:
        from_attributes = True
