from enum import Enum

from sqlalchemy import (Column, DateTime, Enum, ForeignKey, Integer, String,
                        Text)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.backend.database import Base
from app.backend.schema import Gender, UserRole


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    question_answers = relationship("QuestionAnswer", back_populates="candidate")
    question_scores = relationship("QuestionScore", back_populates="candidate")
    posted_jobs = relationship("Job", back_populates="recruiter")


class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(
        Integer, primary_key=True, index=True, nullable=False, autoincrement=True
    )

    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    experience = Column(String, nullable=False)
    job_overview = Column(Text, nullable=False)
    key_responsibilities = Column(Text, nullable=False)
    must_have_skills = Column(Text, nullable=False)
    good_to_have_skills = Column(Text, nullable=True)  # optional field
    recruiter_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    job_type = Column(String, nullable=False)
    posted_date = Column(DateTime, nullable=False, server_default=func.now())

    recruiter = relationship("User", back_populates="posted_jobs")
    applications = relationship("JobApplication", back_populates="job")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.job_id"), nullable=False)
    first_name = Column(String, nullable=False)
    middle_name = Column(String, nullable=True)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    experience_years = Column(Integer, nullable=False)
    experience_months = Column(Integer, nullable=False)
    current_city = Column(String, nullable=False)
    resume_path = Column(String, nullable=False)  # We'll store the file path
    gender = Column(Enum(Gender), nullable=False)
    parsed_resume = Column(JSONB, nullable=True)

    # Relationship to Job
    job = relationship("Job", back_populates="applications")
    # Relationship to QuestionScore
    question_scores = relationship("QuestionScore", back_populates="application")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    text = Column(String, nullable=False)
    tags = Column(String, nullable=True)

    question_answers = relationship("QuestionAnswer", back_populates="question")
    question_scores = relationship("QuestionScore", back_populates="question")


class QuestionAnswer(Base):
    __tablename__ = "question_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    resume_path = Column(String, nullable=False)
    jd_path = Column(String, nullable=False)
    answer = Column(Text, nullable=False)

    question = relationship("Question", back_populates="question_answers")
    candidate = relationship("User", back_populates="question_answers")


class QuestionScore(Base):
    __tablename__ = "question_scores"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("job_applications.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    candidate = relationship("User", back_populates="question_scores")
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    technical_correctness = Column(Integer, nullable=False)
    specificity_depth = Column(Integer, nullable=False)
    reasoning_quality = Column(Integer, nullable=False)
    real_world_signals = Column(Integer, nullable=False)
    communication = Column(Integer, nullable=False)
    final_score = Column(Integer, nullable=False)
    verdict = Column(String, nullable=False)
    improvement_tips = Column(Text, nullable=True)

    # Relationship to JobApplication
    application = relationship("JobApplication", back_populates="question_scores")
    # Relationship to Candidate
    candidate = relationship("User", back_populates="question_scores")
    # Relationship to Question
    question = relationship("Question", back_populates="question_scores")
