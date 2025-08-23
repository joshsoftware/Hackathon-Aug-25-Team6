// Database schema types for the candidate pre-screening application

export interface User {
  id: string
  email: string
  name: string
  role: "candidate" | "recruiter" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface JobDescription {
  id: string
  title: string
  company: string
  description: string
  requirements: string[]
  skills: string[]
  experience: string
  location: string
  salary?: string
  recruiterId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Application {
  id: string
  candidateId: string
  jobId: string
  cvUrl: string
  cvText: string
  status: "pending" | "screening" | "completed" | "rejected" | "approved"
  score?: number
  readyForNextRound: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  applicationId: string
  questionText: string
  questionType: "technical" | "behavioral" | "experience"
  order: number
  createdAt: Date
}

export interface Answer {
  id: string
  questionId: string
  answerText: string
  score?: number
  feedback?: string
  createdAt: Date
}

export interface Report {
  id: string
  applicationId: string
  overallScore: number
  technicalScore: number
  behavioralScore: number
  experienceScore: number
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  readyForNextRound: boolean
  createdAt: Date
}

export interface ParsedCV {
  personalInfo: {
    name: string
    email: string
    phone?: string
    location?: string
    linkedIn?: string
    github?: string
  }
  summary?: string
  skills: string[]
  experience: {
    company: string
    position: string
    duration: string
    description: string
    technologies?: string[]
  }[]
  education: {
    institution: string
    degree: string
    field: string
    year: string
    gpa?: string
  }[]
  projects?: {
    name: string
    description: string
    technologies: string[]
    url?: string
  }[]
  certifications?: {
    name: string
    issuer: string
    date: string
  }[]
  languages?: {
    language: string
    proficiency: string
  }[]
}

export interface ParsedJD {
  basicInfo: {
    title: string
    company: string
    location: string
    type: string
    salary?: string
    experience: string
  }
  description: string
  responsibilities: string[]
  requirements: {
    technical: string[]
    soft: string[]
    experience: string[]
    education: string[]
  }
  skills: {
    required: string[]
    preferred: string[]
  }
  benefits?: string[]
  companyInfo?: string
}

export interface MatchingResult {
  overallMatch: number
  skillsMatch: number
  experienceMatch: number
  educationMatch: number
  details: {
    matchedSkills: string[]
    missingSkills: string[]
    experienceGap: string
    recommendations: string[]
  }
}
