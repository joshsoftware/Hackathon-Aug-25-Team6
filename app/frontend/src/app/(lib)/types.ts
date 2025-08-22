export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: "full-time" | "part-time" | "contract" | "remote"
  salary?: {
    min: number
    max: number
    currency: string
  }
  description: string
  requirements: string[]
  mustHaveSkills: string[]
  goodToHaveSkills: string[]
  postedDate: string
  applicationDeadline: string
  status: "active" | "closed" | "draft"
  applicantCount: number
  recruiterId: string
}

export interface JobApplication {
  id: string
  jobId: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  resumeUrl?: string
  status: "pending" | "screening" | "interview" | "rejected" | "hired"
  appliedDate: string
  matchScore?: number
  prescreeningAnswers?: PrescreeningAnswer[]
}

export interface PrescreeningAnswer {
  questionId: string
  question: string
  answer: string
  score?: number
}

export interface CandidateReport {
  candidateId: string
  jobId: string
  overallMatch: number
  skillsMatch: number
  experienceMatch: number
  confidenceScore: number
  softSkillsScore: number
  matchReasons: string[]
  mismatchReasons: string[]
  prescreeningScore: number
}
