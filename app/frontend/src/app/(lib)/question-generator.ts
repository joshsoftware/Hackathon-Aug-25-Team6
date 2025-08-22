import type { Job } from "./types"
import type { Question, QuestionSet } from "./question-types"

// AI-powered question generation based on job requirements
export class QuestionGenerator {
  static generateQuestionsForJob(job: Job, resumeAnalysis?: any): QuestionSet {
    const questions: Question[] = []

    // Technical skills questions
    job.mustHaveSkills.forEach((skill, index) => {
      questions.push(this.createSkillExperienceQuestion(skill, index + 1))
      if (index < 2) {
        // Only create assessments for top 2 skills
        questions.push(this.createSkillAssessmentQuestion(skill, index + 10))
      }
    })

    // Experience and requirements questions
    job.requirements.forEach((requirement, index) => {
      questions.push(this.createRequirementQuestion(requirement, index + 20))
    })

    // Behavioral and cultural fit questions
    questions.push(this.createAvailabilityQuestion("30"))
    questions.push(this.createWorkEnvironmentQuestion("31"))
    questions.push(this.createMotivationQuestion("32"))

    // Job-specific scenario questions
    questions.push(this.createScenarioQuestion(job, "40"))

    return {
      id: `qs-${job.id}-${Date.now()}`,
      jobId: job.id,
      questions,
      generatedAt: new Date().toISOString(),
      customized: false,
    }
  }

  private static createSkillExperienceQuestion(skill: string, id: number): Question {
    return {
      id: id.toString(),
      type: "experience-level",
      question: `What is your experience level with ${skill}?`,
      required: true,
      weight: 8,
      category: "technical",
      skill,
      levels: [
        {
          id: "beginner",
          label: "Beginner",
          description: "Less than 1 year of experience",
          yearsMin: 0,
          yearsMax: 1,
          score: 25,
        },
        {
          id: "intermediate",
          label: "Intermediate",
          description: "1-3 years of experience",
          yearsMin: 1,
          yearsMax: 3,
          score: 60,
        },
        {
          id: "advanced",
          label: "Advanced",
          description: "3-5 years of experience",
          yearsMin: 3,
          yearsMax: 5,
          score: 85,
        },
        {
          id: "expert",
          label: "Expert",
          description: "5+ years of experience",
          yearsMin: 5,
          score: 100,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private static createSkillAssessmentQuestion(skill: string, id: number): Question {
    const assessments = this.getSkillAssessments()
    const assessment = assessments[skill] || assessments.default

    return {
      id: id.toString(),
      type: "skill-assessment",
      question: assessment.question,
      required: true,
      weight: 9,
      category: "technical",
      skill,
      difficultyLevel: "intermediate",
      options: assessment.options,
      correctAnswer: assessment.correctAnswer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private static createRequirementQuestion(requirement: string, id: number): Question {
    return {
      id: id.toString(),
      type: "text",
      question: `How do you meet this requirement: "${requirement}"? Please provide specific examples.`,
      required: true,
      weight: 7,
      category: "experience",
      minLength: 50,
      maxLength: 500,
      placeholder: "Describe your relevant experience and provide specific examples...",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private static createAvailabilityQuestion(id: string): Question {
    return {
      id,
      type: "multiple-choice",
      question: "When can you start if selected for this position?",
      required: true,
      weight: 5,
      category: "availability",
      options: [
        { id: "immediate", text: "Immediately", score: 100 },
        { id: "2weeks", text: "2 weeks notice", score: 90 },
        { id: "1month", text: "1 month notice", score: 70 },
        { id: "more", text: "More than 1 month", score: 40 },
      ],
      allowMultiple: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private static createWorkEnvironmentQuestion(id: string): Question {
    return {
      id,
      type: "multiple-choice",
      question: "What is your preferred work environment?",
      required: true,
      weight: 4,
      category: "cultural-fit",
      options: [
        { id: "remote", text: "Fully remote", score: 80 },
        { id: "hybrid", text: "Hybrid (2-3 days in office)", score: 90 },
        { id: "onsite", text: "Fully on-site", score: 70 },
        { id: "flexible", text: "Flexible/No preference", score: 100 },
      ],
      allowMultiple: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private static createMotivationQuestion(id: string): Question {
    return {
      id,
      type: "text",
      question: "What motivates you most about this role and our company?",
      required: true,
      weight: 6,
      category: "behavioral",
      minLength: 30,
      maxLength: 300,
      placeholder: "Share what excites you about this opportunity...",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private static createScenarioQuestion(job: Job, id: string): Question {
    const scenarios = this.getJobScenarios()
    const scenario = scenarios[job.title.toLowerCase()] || scenarios.default

    return {
      id,
      type: "scenario",
      question: scenario.question,
      scenario: scenario.scenario,
      required: true,
      weight: 8,
      category: "job-specific",
      evaluationCriteria: scenario.criteria,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private static getSkillAssessments(): Record<string, any> {
    return {
      React: {
        question: "Which React hook would you use to manage component state that persists across re-renders?",
        options: [
          { id: "a", text: "useEffect", score: 0 },
          { id: "b", text: "useState", score: 100 },
          { id: "c", text: "useCallback", score: 20 },
          { id: "d", text: "useMemo", score: 10 },
        ],
        correctAnswer: "b",
      },
      TypeScript: {
        question: "What is the main benefit of using TypeScript over JavaScript?",
        options: [
          { id: "a", text: "Better performance", score: 20 },
          { id: "b", text: "Static type checking", score: 100 },
          { id: "c", text: "Smaller bundle size", score: 0 },
          { id: "d", text: "Built-in testing framework", score: 0 },
        ],
        correctAnswer: "b",
      },
      default: {
        question: "Rate your proficiency with this technology on a scale of 1-10.",
        options: Array.from({ length: 10 }, (_, i) => ({
          id: (i + 1).toString(),
          text: (i + 1).toString(),
          score: (i + 1) * 10,
        })),
        correctAnswer: "10",
      },
    }
  }

  private static getJobScenarios(): Record<string, any> {
    return {
      "senior frontend developer": {
        question: "How would you approach this technical challenge?",
        scenario:
          "You need to optimize a React application that's experiencing performance issues. The app has multiple heavy components that re-render frequently, causing lag in user interactions. Walk us through your debugging and optimization process.",
        criteria: [
          "Identifies performance bottlenecks",
          "Mentions React profiling tools",
          "Suggests appropriate optimization techniques",
          "Considers user experience impact",
        ],
      },
      "product manager": {
        question: "How would you handle this product scenario?",
        scenario:
          "You're launching a new feature, but early user feedback is mixed. Some users love it, others find it confusing. Your engineering team is pushing to move on to the next feature. How do you proceed?",
        criteria: [
          "Data-driven decision making",
          "Stakeholder management",
          "User-centric approach",
          "Clear communication strategy",
        ],
      },
      default: {
        question: "How would you approach this work scenario?",
        scenario:
          "Describe how you would handle a situation where you need to collaborate with team members who have different working styles and priorities than you.",
        criteria: ["Communication skills", "Adaptability", "Problem-solving approach", "Team collaboration"],
      },
    }
  }
}

// Question scoring system
export class QuestionScorer {
  static scoreAnswer(question: Question, answer: string): number {
    switch (question.type) {
      case "multiple-choice":
        const mcq = question as any
        const selectedOption = mcq.options.find((opt: any) => opt.id === answer || opt.text === answer)
        return selectedOption ? selectedOption.score : 0

      case "experience-level":
        const expq = question as any
        const selectedLevel = expq.levels.find((level: any) => level.id === answer)
        return selectedLevel ? selectedLevel.score : 0

      case "yes-no":
        const ynq = question as any
        return answer.toLowerCase() === "yes" ? ynq.positiveWeight || 100 : 0

      case "rating":
        const ratingq = question as any
        const rating = Number.parseInt(answer)
        return isNaN(rating) ? 0 : (rating / ratingq.scale) * 100

      case "text":
      case "scenario":
        // For text answers, we'd typically use AI/NLP to score
        // For now, return a base score that can be manually adjusted
        return answer.length > 20 ? 70 : 30

      case "skill-assessment":
        const skillq = question as any
        return answer === skillq.correctAnswer ? 100 : 0

      default:
        return 50 // Default neutral score
    }
  }

  static calculateOverallScore(questions: Question[], answers: Record<string, string>): number {
    let totalWeightedScore = 0
    let totalWeight = 0

    questions.forEach((question) => {
      const answer = answers[question.id]
      if (answer) {
        const score = this.scoreAnswer(question, answer)
        totalWeightedScore += score * question.weight
        totalWeight += question.weight
      }
    })

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  }
}
