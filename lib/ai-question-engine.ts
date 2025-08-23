// AI-powered question generation engine for candidate screening
import type { ParsedCV, ParsedJD, MatchingResult } from "./types"

export interface AIQuestion {
  id: string
  text: string
  type: "technical" | "behavioral" | "experience" | "situational" | "company_specific"
  difficulty: "easy" | "medium" | "hard"
  category: string
  followUpTriggers?: string[]
  expectedKeywords?: string[]
  scoringCriteria: {
    technical: number
    communication: number
    problemSolving: number
    experience: number
  }
}

export interface AIResponse {
  questionId: string
  answer: string
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  followUpGenerated?: AIQuestion
}

export interface InterviewSession {
  id: string
  jobId: string
  candidateId: string
  questions: AIQuestion[]
  responses: AIResponse[]
  currentQuestionIndex: number
  overallScore: number
  isCompleted: boolean
  adaptiveFlow: boolean
  createdAt: Date
}

export class AIQuestionEngine {
  private static questionTemplates = {
    technical: {
      programming: [
        "Explain how you would implement {concept} in {technology}. What are the key considerations?",
        "Walk me through your approach to debugging a {complexity} issue in {technology}.",
        "How would you optimize {scenario} for better performance in {technology}?",
        "Describe the trade-offs between {option1} and {option2} when building {application_type}.",
        "What testing strategies would you use for {component_type} in {technology}?",
      ],
      architecture: [
        "How would you design a {system_type} that handles {scale} users?",
        "Explain your approach to {architectural_pattern} in the context of {domain}.",
        "What factors would you consider when choosing between {tech1} and {tech2} for {use_case}?",
        "How would you ensure {quality_attribute} in a {system_type}?",
        "Describe how you would implement {feature} while maintaining {constraint}.",
      ],
      problemSolving: [
        "Given {scenario}, how would you approach solving this problem?",
        "Walk me through your thought process for {complex_problem}.",
        "How would you handle {edge_case} in {context}?",
        "What would be your strategy for {optimization_challenge}?",
        "Explain how you would troubleshoot {technical_issue}.",
      ],
    },
    behavioral: {
      leadership: [
        "Tell me about a time when you had to lead a team through {challenge}.",
        "Describe a situation where you had to influence others without authority.",
        "How do you handle conflicts within your team?",
        "Give an example of when you had to make a difficult decision with limited information.",
        "Tell me about a time when you had to adapt your leadership style.",
      ],
      collaboration: [
        "Describe a challenging collaboration experience and how you handled it.",
        "How do you ensure effective communication in cross-functional teams?",
        "Tell me about a time when you had to work with a difficult stakeholder.",
        "Give an example of when you had to compromise on a technical decision.",
        "How do you handle disagreements about technical approaches?",
      ],
      growth: [
        "Tell me about a time when you failed and what you learned from it.",
        "How do you stay current with technology trends in {field}?",
        "Describe a skill you developed recently and how you approached learning it.",
        "What's the most challenging feedback you've received and how did you act on it?",
        "How do you balance learning new technologies with delivering on current projects?",
      ],
    },
    experience: [
      "Walk me through your experience with {technology} and how you've applied it.",
      "Describe the most complex {project_type} you've worked on.",
      "How has your approach to {skill} evolved throughout your career?",
      "Tell me about a time when you had to learn {technology} quickly for a project.",
      "What's been your experience working in {environment_type} environments?",
    ],
    situational: [
      "How would you handle a situation where {scenario}?",
      "If you discovered {problem} in production, what would be your immediate steps?",
      "How would you approach {challenge} given {constraints}?",
      "What would you do if {conflict_scenario}?",
      "How would you prioritize {competing_demands}?",
    ],
    company_specific: [
      "Why are you interested in working at {company}?",
      "How do you see yourself contributing to {company}'s mission of {mission}?",
      "What attracts you to {company}'s approach to {company_focus}?",
      "How would you handle {company_specific_challenge}?",
      "What questions do you have about {company}'s {aspect}?",
    ],
  }

  static generateQuestions(
    jd: ParsedJD,
    cv?: ParsedCV,
    previousResponses?: AIResponse[],
    sessionConfig = { adaptiveFlow: true, questionCount: 5 },
  ): AIQuestion[] {
    const questions: AIQuestion[] = []
    const usedTemplates = new Set<string>()

    // Generate initial question set based on JD and CV match
    const matchResult = cv ? this.analyzeMatch(cv, jd) : null

    // 1. Technical questions based on required skills
    const technicalQuestions = this.generateTechnicalQuestions(jd, cv, matchResult)
    questions.push(...technicalQuestions.slice(0, 2))

    // 2. Experience-based questions
    const experienceQuestions = this.generateExperienceQuestions(jd, cv)
    questions.push(...experienceQuestions.slice(0, 1))

    // 3. Behavioral questions
    const behavioralQuestions = this.generateBehavioralQuestions(jd, cv)
    questions.push(...behavioralQuestions.slice(0, 1))

    // 4. Company-specific question
    const companyQuestions = this.generateCompanyQuestions(jd)
    questions.push(...companyQuestions.slice(0, 1))

    // Adaptive follow-up questions based on previous responses
    if (sessionConfig.adaptiveFlow && previousResponses && previousResponses.length > 0) {
      const followUpQuestions = this.generateFollowUpQuestions(previousResponses, jd, cv)
      questions.push(...followUpQuestions)
    }

    return questions.slice(0, sessionConfig.questionCount)
  }

  private static generateTechnicalQuestions(jd: ParsedJD, cv?: ParsedCV, match?: MatchingResult): AIQuestion[] {
    const questions: AIQuestion[] = []
    const requiredSkills = jd.skills.required.slice(0, 3)

    requiredSkills.forEach((skill, index) => {
      const hasSkill = cv?.skills.some(
        (cvSkill) =>
          cvSkill.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(cvSkill.toLowerCase()),
      )

      const difficulty = hasSkill ? "medium" : "hard"
      const templates = this.questionTemplates.technical.programming

      const template = templates[index % templates.length]
      const questionText = template
        .replace("{technology}", skill)
        .replace("{concept}", this.getTechnicalConcept(skill))
        .replace("{complexity}", difficulty === "hard" ? "complex" : "moderate")
        .replace("{scenario}", this.getTechnicalScenario(skill))
        .replace(
          "{application_type}",
          jd.basicInfo.title.toLowerCase().includes("frontend") ? "web application" : "system",
        )

      questions.push({
        id: `tech_${index + 1}`,
        text: questionText,
        type: "technical",
        difficulty,
        category: skill,
        expectedKeywords: this.getExpectedKeywords(skill),
        scoringCriteria: {
          technical: 0.6,
          communication: 0.2,
          problemSolving: 0.15,
          experience: 0.05,
        },
      })
    })

    return questions
  }

  private static generateExperienceQuestions(jd: ParsedJD, cv?: ParsedCV): AIQuestion[] {
    const questions: AIQuestion[] = []
    const experienceLevel = this.determineExperienceLevel(jd.basicInfo.experience)

    const template =
      cv && cv.experience.length > 0
        ? `Tell me about your experience with ${cv.experience[0].position} at ${cv.experience[0].company}. How does this experience prepare you for ${jd.basicInfo.title}?`
        : `Describe your most relevant experience for this ${jd.basicInfo.title} position. What specific projects or achievements demonstrate your readiness for this role?`

    questions.push({
      id: "exp_1",
      text: template,
      type: "experience",
      difficulty: experienceLevel === "senior" ? "medium" : "easy",
      category: "relevant_experience",
      expectedKeywords: [...jd.skills.required, ...jd.requirements.technical.slice(0, 3)],
      scoringCriteria: {
        technical: 0.3,
        communication: 0.3,
        problemSolving: 0.2,
        experience: 0.2,
      },
    })

    return questions
  }

  private static generateBehavioralQuestions(jd: ParsedJD, cv?: ParsedCV): AIQuestion[] {
    const questions: AIQuestion[] = []
    const isLeadershipRole =
      jd.basicInfo.title.toLowerCase().includes("senior") || jd.basicInfo.title.toLowerCase().includes("lead")

    const behaviorType = isLeadershipRole ? "leadership" : "collaboration"
    const templates = this.questionTemplates.behavioral[behaviorType]
    const template = templates[Math.floor(Math.random() * templates.length)]

    const questionText = template.replace("{challenge}", this.getBehavioralChallenge(jd.basicInfo.title))

    questions.push({
      id: "behav_1",
      text: questionText,
      type: "behavioral",
      difficulty: "medium",
      category: behaviorType,
      scoringCriteria: {
        technical: 0.1,
        communication: 0.4,
        problemSolving: 0.3,
        experience: 0.2,
      },
    })

    return questions
  }

  private static generateCompanyQuestions(jd: ParsedJD): AIQuestion[] {
    const questions: AIQuestion[] = []

    const template = `Why are you interested in working at ${jd.basicInfo.company}? What specifically attracts you to this ${jd.basicInfo.title} role?`

    questions.push({
      id: "company_1",
      text: template,
      type: "company_specific",
      difficulty: "easy",
      category: "motivation",
      scoringCriteria: {
        technical: 0.0,
        communication: 0.5,
        problemSolving: 0.2,
        experience: 0.3,
      },
    })

    return questions
  }

  private static generateFollowUpQuestions(responses: AIResponse[], jd: ParsedJD, cv?: ParsedCV): AIQuestion[] {
    const followUps: AIQuestion[] = []

    // Analyze responses for areas needing deeper exploration
    responses.forEach((response, index) => {
      if (response.score < 60 && response.improvements.length > 0) {
        // Generate clarifying question for low-scoring responses
        const clarifyingQuestion = this.generateClarifyingQuestion(response, jd)
        if (clarifyingQuestion) followUps.push(clarifyingQuestion)
      }

      if (response.score > 80 && index < responses.length - 1) {
        // Generate advanced follow-up for high-scoring responses
        const advancedQuestion = this.generateAdvancedFollowUp(response, jd)
        if (advancedQuestion) followUps.push(advancedQuestion)
      }
    })

    return followUps.slice(0, 2) // Limit follow-ups
  }

  private static generateClarifyingQuestion(response: AIResponse, jd: ParsedJD): AIQuestion | null {
    const improvement = response.improvements[0]
    if (!improvement) return null

    return {
      id: `followup_clarify_${Date.now()}`,
      text: `I'd like to understand more about ${improvement.toLowerCase()}. Can you provide a specific example or elaborate on your approach?`,
      type: "situational",
      difficulty: "medium",
      category: "clarification",
      scoringCriteria: {
        technical: 0.3,
        communication: 0.4,
        problemSolving: 0.2,
        experience: 0.1,
      },
    }
  }

  private static generateAdvancedFollowUp(response: AIResponse, jd: ParsedJD): AIQuestion | null {
    return {
      id: `followup_advanced_${Date.now()}`,
      text: `That's a great approach. How would you scale or adapt that solution for a larger, more complex scenario?`,
      type: "technical",
      difficulty: "hard",
      category: "advanced_thinking",
      scoringCriteria: {
        technical: 0.5,
        communication: 0.2,
        problemSolving: 0.25,
        experience: 0.05,
      },
    }
  }

  static scoreResponse(question: AIQuestion, answer: string, cv?: ParsedCV): AIResponse {
    const analysis = this.analyzeResponse(answer, question)
    const score = this.calculateScore(analysis, question, cv)

    return {
      questionId: question.id,
      answer,
      score,
      feedback: this.generateFeedback(analysis, question, score),
      strengths: this.identifyStrengths(analysis, question),
      improvements: this.identifyImprovements(analysis, question, score),
    }
  }

  private static analyzeResponse(answer: string, question: AIQuestion) {
    const wordCount = answer.trim().split(/\s+/).length
    const hasExamples = /example|instance|time when|situation|project/i.test(answer)
    const hasTechnicalTerms =
      question.expectedKeywords?.some((keyword) => answer.toLowerCase().includes(keyword.toLowerCase())) || false
    const isStructured = /first|second|then|next|finally|additionally/i.test(answer)

    return {
      wordCount,
      hasExamples,
      hasTechnicalTerms,
      isStructured,
      sentiment: this.analyzeSentiment(answer),
      complexity: this.analyzeComplexity(answer),
    }
  }

  private static calculateScore(analysis: any, question: AIQuestion, cv?: ParsedCV): number {
    let score = 0
    const criteria = question.scoringCriteria

    // Technical score
    if (question.type === "technical") {
      score += analysis.hasTechnicalTerms ? criteria.technical * 100 : criteria.technical * 30
    } else {
      score += criteria.technical * 70 // Base technical understanding
    }

    // Communication score
    const communicationScore = Math.min(100, (analysis.wordCount / 300) * 100) // Optimal around 300 words
    score += criteria.communication * communicationScore

    // Problem-solving score
    const problemSolvingScore = (analysis.isStructured ? 80 : 40) + (analysis.hasExamples ? 20 : 0)
    score += criteria.problemSolving * problemSolvingScore

    // Experience score
    const experienceScore = analysis.hasExamples ? 90 : 50
    score += criteria.experience * experienceScore

    return Math.round(Math.min(100, score))
  }

  private static generateFeedback(analysis: any, question: AIQuestion, score: number): string {
    const feedback: string[] = []

    if (score >= 80) {
      feedback.push("Excellent response! You demonstrated strong understanding and provided clear examples.")
    } else if (score >= 60) {
      feedback.push("Good response with room for improvement.")
    } else {
      feedback.push("Your response shows potential but needs more development.")
    }

    if (question.type === "technical" && !analysis.hasTechnicalTerms) {
      feedback.push("Consider including more specific technical details and terminology.")
    }

    if (!analysis.hasExamples && (question.type === "behavioral" || question.type === "experience")) {
      feedback.push("Adding concrete examples would strengthen your response significantly.")
    }

    if (analysis.wordCount < 100) {
      feedback.push("Try to provide more detailed explanations to fully demonstrate your knowledge.")
    }

    return feedback.join(" ")
  }

  private static identifyStrengths(analysis: any, question: AIQuestion): string[] {
    const strengths: string[] = []

    if (analysis.hasExamples) strengths.push("Provided concrete examples")
    if (analysis.isStructured) strengths.push("Well-structured response")
    if (analysis.hasTechnicalTerms) strengths.push("Demonstrated technical knowledge")
    if (analysis.wordCount > 200) strengths.push("Comprehensive explanation")
    if (analysis.sentiment > 0.5) strengths.push("Positive and confident tone")

    return strengths
  }

  private static identifyImprovements(analysis: any, question: AIQuestion, score: number): string[] {
    const improvements: string[] = []

    if (!analysis.hasExamples && score < 70) improvements.push("Include specific examples")
    if (!analysis.isStructured) improvements.push("Organize response more clearly")
    if (question.type === "technical" && !analysis.hasTechnicalTerms) {
      improvements.push("Use more technical terminology")
    }
    if (analysis.wordCount < 150) improvements.push("Provide more detailed explanations")
    if (analysis.complexity < 0.3) improvements.push("Demonstrate deeper understanding")

    return improvements
  }

  // Helper methods
  private static analyzeMatch(cv: ParsedCV, jd: ParsedJD): MatchingResult {
    // Simplified matching logic
    const skillsMatch =
      (cv.skills.filter((skill) => jd.skills.required.some((req) => skill.toLowerCase().includes(req.toLowerCase())))
        .length /
        jd.skills.required.length) *
      100

    return {
      overallMatch: Math.round(skillsMatch),
      skillsMatch: Math.round(skillsMatch),
      experienceMatch: cv.experience.length > 0 ? 80 : 40,
      educationMatch: cv.education.length > 0 ? 90 : 60,
      details: {
        matchedSkills: cv.skills.filter((skill) =>
          jd.skills.required.some((req) => skill.toLowerCase().includes(req.toLowerCase())),
        ),
        missingSkills: jd.skills.required.filter(
          (req) => !cv.skills.some((skill) => skill.toLowerCase().includes(req.toLowerCase())),
        ),
        experienceGap: "Meets requirements",
        recommendations: [],
      },
    }
  }

  private static getTechnicalConcept(skill: string): string {
    const concepts: Record<string, string> = {
      react: "component lifecycle",
      javascript: "closures and async programming",
      python: "decorators and context managers",
      "node.js": "event loop and streams",
      sql: "query optimization",
      aws: "serverless architecture",
    }
    return concepts[skill.toLowerCase()] || "core concepts"
  }

  private static getTechnicalScenario(skill: string): string {
    const scenarios: Record<string, string> = {
      react: "state management in a large application",
      javascript: "memory leak in a single-page application",
      python: "API performance bottleneck",
      "node.js": "high-concurrency server",
      sql: "slow database queries",
      aws: "auto-scaling infrastructure",
    }
    return scenarios[skill.toLowerCase()] || "system performance"
  }

  private static getExpectedKeywords(skill: string): string[] {
    const keywords: Record<string, string[]> = {
      react: ["component", "state", "props", "hooks", "jsx", "virtual dom"],
      javascript: ["async", "promise", "closure", "prototype", "event loop"],
      python: ["decorator", "generator", "list comprehension", "django", "flask"],
      "node.js": ["express", "middleware", "callback", "stream", "cluster"],
      sql: ["join", "index", "query", "optimization", "transaction"],
      aws: ["ec2", "s3", "lambda", "cloudformation", "vpc"],
    }
    return keywords[skill.toLowerCase()] || []
  }

  private static determineExperienceLevel(experience: string): "junior" | "mid" | "senior" {
    if (experience.includes("5+") || experience.includes("senior")) return "senior"
    if (experience.includes("3") || experience.includes("mid")) return "mid"
    return "junior"
  }

  private static getBehavioralChallenge(title: string): string {
    if (title.toLowerCase().includes("senior") || title.toLowerCase().includes("lead")) {
      return "a technical disagreement between team members"
    }
    return "a tight deadline with changing requirements"
  }

  private static analyzeSentiment(text: string): number {
    const positiveWords = ["excited", "passionate", "love", "enjoy", "great", "excellent", "amazing"]
    const negativeWords = ["difficult", "challenging", "problem", "issue", "struggle", "hard"]

    const positive = positiveWords.filter((word) => text.toLowerCase().includes(word)).length
    const negative = negativeWords.filter((word) => text.toLowerCase().includes(word)).length

    return (positive - negative + 5) / 10 // Normalize to 0-1
  }

  private static analyzeComplexity(text: string): number {
    const complexWords = text.split(/\s+/).filter((word) => word.length > 6).length
    const totalWords = text.split(/\s+/).length
    return totalWords > 0 ? complexWords / totalWords : 0
  }
}
