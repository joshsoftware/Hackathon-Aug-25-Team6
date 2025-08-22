export interface BaseQuestion {
  id: string
  type: QuestionType
  question: string
  required: boolean
  weight: number // 1-10 for scoring importance
  category: QuestionCategory
  createdAt: string
  updatedAt: string
}

export type QuestionType =
  | "text"
  | "multiple-choice"
  | "rating"
  | "yes-no"
  | "skill-assessment"
  | "scenario"
  | "experience-level"

export type QuestionCategory =
  | "technical"
  | "experience"
  | "behavioral"
  | "availability"
  | "cultural-fit"
  | "job-specific"

export interface TextQuestion extends BaseQuestion {
  type: "text"
  minLength?: number
  maxLength?: number
  placeholder?: string
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice"
  options: QuestionOption[]
  allowMultiple: boolean
}

export interface RatingQuestion extends BaseQuestion {
  type: "rating"
  scale: number // 1-5, 1-10, etc.
  labels: {
    low: string
    high: string
  }
}

export interface YesNoQuestion extends BaseQuestion {
  type: "yes-no"
  positiveWeight: number // How much weight to give "yes" vs "no"
}

export interface SkillAssessmentQuestion extends BaseQuestion {
  type: "skill-assessment"
  skill: string
  difficultyLevel: "beginner" | "intermediate" | "advanced"
  correctAnswer?: string
  options?: QuestionOption[]
}

export interface ScenarioQuestion extends BaseQuestion {
  type: "scenario"
  scenario: string
  evaluationCriteria: string[]
}

export interface ExperienceLevelQuestion extends BaseQuestion {
  type: "experience-level"
  skill: string
  levels: ExperienceLevel[]
}

export interface QuestionOption {
  id: string
  text: string
  score: number // 0-100 for scoring
}

export interface ExperienceLevel {
  id: string
  label: string
  description: string
  yearsMin: number
  yearsMax?: number
  score: number
}

export type Question =
  | TextQuestion
  | MultipleChoiceQuestion
  | RatingQuestion
  | YesNoQuestion
  | SkillAssessmentQuestion
  | ScenarioQuestion
  | ExperienceLevelQuestion

export interface QuestionTemplate {
  id: string
  name: string
  description: string
  category: QuestionCategory
  questions: Question[]
  tags: string[]
}

export interface QuestionSet {
  id: string
  jobId: string
  questions: Question[]
  generatedAt: string
  customized: boolean
}
