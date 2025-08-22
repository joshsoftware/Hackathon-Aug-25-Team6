from enum import Enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.backend.database import Base
from app.backend.schema import Gender, UserRole


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)


class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(Integer, primary_key=True, unique=True, index=True, nullable=False)
    location = Column(String, nullable=False)
    experience = Column(String, nullable=False)
    job_overview = Column(Text, nullable=False)
    key_responsibilities = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=False)
    qualifications = Column(Text, nullable=False)
    good_to_have_skills = Column(Text, nullable=True)  # optional field

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

    # Relationship to Job
    job = relationship("Job", back_populates="applications")
