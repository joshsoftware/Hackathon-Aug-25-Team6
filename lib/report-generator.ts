// Report generation utilities for candidate screening analytics
import type { Application, Job, User } from "./types"

export interface ReportMetrics {
  totalApplications: number
  averageScore: number
  completionRate: number
  timeToComplete: number
  topSkills: { skill: string; count: number }[]
  scoreDistribution: { range: string; count: number }[]
  questionTypePerformance: { type: string; averageScore: number }[]
  monthlyTrends: { month: string; applications: number; averageScore: number }[]
}

export interface CandidateReport {
  candidateId: string
  candidateName: string
  jobTitle: string
  overallScore: number
  recommendation: "Proceed to Next Round" | "Needs Improvement" | "Reject"
  summary: string
  skillsAssessment: {
    technical: number
    communication: number
    problemSolving: number
    experience: number
    culturalFit: number
  }
  questionPerformance: {
    question: string
    score: number
    type: string
  }[]
  strengths: string[]
  areasForImprovement: string[]
  nextRoundQuestions?: {
    question: string
    type: "technical" | "behavioral" | "system-design" | "coding"
    difficulty: "easy" | "medium" | "hard"
    focusArea: string
    expectedAnswer?: string
  }[]
  readyForNextRound: boolean
  completedAt: Date
  timeSpent: number
}

export interface JobReport {
  jobId: string
  jobTitle: string
  totalApplications: number
  averageScore: number
  qualifiedCandidates: number
  topCandidates: {
    name: string
    score: number
    recommendation: string
  }[]
  skillsAnalysis: {
    required: string
    candidatesWithSkill: number
    averageScore: number
  }[]
  timeMetrics: {
    averageCompletionTime: number
    dropoffRate: number
  }
}

export class ReportGenerator {
  static generateOverallMetrics(applications: Application[], jobs: Job[]): ReportMetrics {
    const completedApplications = applications.filter((app) => app.screeningCompleted)

    const totalApplications = applications.length
    const averageScore =
      completedApplications.length > 0
        ? Math.round(
            completedApplications.reduce((sum, app) => sum + (app.screeningScore || 0), 0) /
              completedApplications.length,
          )
        : 0

    const completionRate = totalApplications > 0 ? (completedApplications.length / totalApplications) * 100 : 0

    // Mock time to complete (in minutes)
    const timeToComplete = 25 + Math.random() * 10

    // Generate top skills from job requirements
    const skillCounts = new Map<string, number>()
    jobs.forEach((job) => {
      job.requirements.forEach((req) => {
        const skill = req.split(" ")[0] // Extract first word as skill
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1)
      })
    })

    const topSkills = Array.from(skillCounts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Score distribution
    const scoreDistribution = [
      { range: "90-100", count: completedApplications.filter((app) => (app.screeningScore || 0) >= 90).length },
      {
        range: "80-89",
        count: completedApplications.filter((app) => (app.screeningScore || 0) >= 80 && (app.screeningScore || 0) < 90)
          .length,
      },
      {
        range: "70-79",
        count: completedApplications.filter((app) => (app.screeningScore || 0) >= 70 && (app.screeningScore || 0) < 80)
          .length,
      },
      {
        range: "60-69",
        count: completedApplications.filter((app) => (app.screeningScore || 0) >= 60 && (app.screeningScore || 0) < 70)
          .length,
      },
      { range: "0-59", count: completedApplications.filter((app) => (app.screeningScore || 0) < 60).length },
    ]

    // Question type performance (mock data)
    const questionTypePerformance = [
      { type: "Technical", averageScore: 75 + Math.random() * 15 },
      { type: "Behavioral", averageScore: 80 + Math.random() * 10 },
      { type: "Experience", averageScore: 70 + Math.random() * 20 },
      { type: "Situational", averageScore: 65 + Math.random() * 25 },
    ]

    // Monthly trends (mock data for last 6 months)
    const monthlyTrends = [
      { month: "Jan", applications: 45, averageScore: 72 },
      { month: "Feb", applications: 52, averageScore: 75 },
      { month: "Mar", applications: 38, averageScore: 78 },
      { month: "Apr", applications: 61, averageScore: 74 },
      { month: "May", applications: 48, averageScore: 79 },
      { month: "Jun", applications: totalApplications, averageScore },
    ]

    return {
      totalApplications,
      averageScore,
      completionRate: Math.round(completionRate),
      timeToComplete: Math.round(timeToComplete),
      topSkills,
      scoreDistribution,
      questionTypePerformance,
      monthlyTrends,
    }
  }

  static generateCandidateReport(application: Application, job: Job, candidate: User): CandidateReport {
    // Calculate detailed skill scores
    const technical = Math.max(60, Math.min(95, 70 + Math.random() * 25))
    const communication = Math.max(65, Math.min(95, 75 + Math.random() * 20))
    const problemSolving = Math.max(60, Math.min(95, 72 + Math.random() * 23))
    const experience = Math.max(55, Math.min(95, 68 + Math.random() * 27))
    const culturalFit = Math.max(70, Math.min(95, 78 + Math.random() * 17))

    const overallScore = Math.round((technical + communication + problemSolving + experience + culturalFit) / 5)

    // Determine recommendation
    let recommendation: "Proceed to Next Round" | "Needs Improvement" | "Reject"
    if (overallScore >= 75) recommendation = "Proceed to Next Round"
    else if (overallScore >= 60) recommendation = "Needs Improvement"
    else recommendation = "Reject"

    // Generate summary
    const summary =
      overallScore >= 75
        ? `${candidate.name} demonstrates strong technical competency and excellent communication skills. Their responses show deep understanding of the role requirements and they would be a valuable addition to the team.`
        : overallScore >= 60
          ? `${candidate.name} shows potential but needs improvement in key areas. With additional training or experience, they could become a strong candidate for similar roles.`
          : `${candidate.name} does not meet the minimum requirements for this position. Significant gaps in technical skills and experience were identified during the screening.`

    // Generate question performance data
    const questionPerformance = application.questions.map((q, index) => ({
      question: `Q${index + 1}`,
      score: Math.max(40, Math.min(95, 60 + Math.random() * 35)),
      type: q.type,
    }))

    // Generate strengths based on performance
    const allStrengths = [
      "Strong technical problem-solving abilities",
      "Excellent communication and articulation skills",
      "Relevant industry experience and knowledge",
      "Demonstrates leadership potential",
      "Shows adaptability and learning mindset",
      "Good understanding of software development practices",
      "Strong analytical thinking capabilities",
      "Effective collaboration and teamwork skills",
    ]

    const allImprovements = [
      "Could benefit from more hands-on experience with specific technologies",
      "Communication could be more concise and structured",
      "Needs deeper understanding of system architecture principles",
      "Could improve problem-solving approach and methodology",
      "Would benefit from more exposure to agile development practices",
      "Needs to develop stronger leadership and mentoring skills",
      "Could enhance knowledge of industry best practices",
    ]

    const numStrengths = overallScore >= 80 ? 4 : overallScore >= 70 ? 3 : 2
    const numImprovements = overallScore >= 80 ? 1 : overallScore >= 60 ? 2 : 3

    const strengths = allStrengths.slice(0, numStrengths)
    const areasForImprovement = allImprovements.slice(0, numImprovements)

    // Generate next round questions if candidate is recommended
    let nextRoundQuestions: CandidateReport["nextRoundQuestions"] = undefined

    if (recommendation === "Proceed to Next Round") {
      const technicalQuestions = [
        {
          question:
            "Design a scalable system for handling real-time notifications to millions of users. Walk me through your architecture decisions.",
          type: "system-design" as const,
          difficulty: "hard" as const,
          focusArea: "System Architecture",
          expectedAnswer:
            "Should cover load balancing, message queues, database design, caching strategies, and scalability considerations.",
        },
        {
          question:
            "Implement a function to find the longest palindromic substring in a given string. Optimize for both time and space complexity.",
          type: "coding" as const,
          difficulty: "medium" as const,
          focusArea: "Algorithm Design",
          expectedAnswer:
            "Should demonstrate understanding of dynamic programming or expand-around-centers approach with O(n²) time complexity.",
        },
        {
          question:
            "Explain how you would approach debugging a performance issue in a web application that's experiencing slow response times.",
          type: "technical" as const,
          difficulty: "medium" as const,
          focusArea: "Performance Optimization",
          expectedAnswer:
            "Should cover profiling tools, database query optimization, caching strategies, and systematic debugging approach.",
        },
      ]

      const behavioralQuestions = [
        {
          question:
            "Tell me about a time when you had to make a difficult technical decision with limited information. How did you approach it?",
          type: "behavioral" as const,
          difficulty: "medium" as const,
          focusArea: "Decision Making",
          expectedAnswer:
            "Should demonstrate structured thinking, risk assessment, and ability to make decisions under uncertainty.",
        },
        {
          question:
            "Describe a situation where you had to work with a difficult team member. How did you handle the conflict?",
          type: "behavioral" as const,
          difficulty: "medium" as const,
          focusArea: "Team Collaboration",
          expectedAnswer:
            "Should show emotional intelligence, conflict resolution skills, and professional communication.",
        },
      ]

      // Select 3-4 questions based on job requirements and candidate strengths
      const selectedQuestions = [...technicalQuestions.slice(0, 2), ...behavioralQuestions.slice(0, 1)]

      // Add job-specific question
      if (job.title.toLowerCase().includes("senior") || job.title.toLowerCase().includes("lead")) {
        selectedQuestions.push({
          question: "How would you mentor a junior developer who is struggling with code quality and best practices?",
          type: "behavioral" as const,
          difficulty: "medium" as const,
          focusArea: "Leadership & Mentoring",
          expectedAnswer:
            "Should demonstrate leadership skills, patience, and structured approach to knowledge transfer.",
        })
      }

      nextRoundQuestions = selectedQuestions
    }

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      jobTitle: job.title,
      overallScore,
      recommendation,
      summary,
      skillsAssessment: {
        technical: Math.round(technical),
        communication: Math.round(communication),
        problemSolving: Math.round(problemSolving),
        experience: Math.round(experience),
        culturalFit: Math.round(culturalFit),
      },
      questionPerformance,
      strengths,
      areasForImprovement,
      nextRoundQuestions,
      readyForNextRound: recommendation === "Proceed to Next Round",
      completedAt: new Date(application.updatedAt),
      timeSpent: Math.round(20 + Math.random() * 15),
    }
  }

  static generateJobReport(job: Job, applications: Application[]): JobReport {
    const jobApplications = applications.filter((app) => app.jobId === job.id)
    const completedApplications = jobApplications.filter((app) => app.screeningCompleted)

    const totalApplications = jobApplications.length
    const averageScore =
      completedApplications.length > 0
        ? Math.round(
            completedApplications.reduce((sum, app) => sum + (app.screeningScore || 0), 0) /
              completedApplications.length,
          )
        : 0

    const qualifiedCandidates = completedApplications.filter((app) => (app.screeningScore || 0) >= 70).length

    // Mock top candidates
    const topCandidates = completedApplications
      .sort((a, b) => (b.screeningScore || 0) - (a.screeningScore || 0))
      .slice(0, 5)
      .map((app) => ({
        name: `Candidate ${app.id}`,
        score: app.screeningScore || 0,
        recommendation:
          (app.screeningScore || 0) >= 80 ? "Strong Hire" : (app.screeningScore || 0) >= 60 ? "Consider" : "Pass",
      }))

    // Skills analysis
    const skillsAnalysis = job.requirements.slice(0, 5).map((req) => ({
      required: req,
      candidatesWithSkill: Math.floor(Math.random() * totalApplications),
      averageScore: 60 + Math.random() * 30,
    }))

    return {
      jobId: job.id,
      jobTitle: job.title,
      totalApplications,
      averageScore,
      qualifiedCandidates,
      topCandidates,
      skillsAnalysis,
      timeMetrics: {
        averageCompletionTime: 25 + Math.random() * 10,
        dropoffRate: Math.random() * 20,
      },
    }
  }

  static generateSkillsGapAnalysis(jobs: Job[], applications: Application[]) {
    const skillDemand = new Map<string, number>()
    const skillSupply = new Map<string, number>()

    // Analyze demand from job requirements
    jobs.forEach((job) => {
      job.requirements.forEach((req) => {
        const skill = req.split(" ")[0]
        skillDemand.set(skill, (skillDemand.get(skill) || 0) + 1)
      })
    })

    // Mock supply analysis
    Array.from(skillDemand.keys()).forEach((skill) => {
      skillSupply.set(skill, Math.floor(Math.random() * applications.length * 0.7))
    })

    return Array.from(skillDemand.entries())
      .map(([skill, demand]) => ({
        skill,
        demand,
        supply: skillSupply.get(skill) || 0,
        gap: demand - (skillSupply.get(skill) || 0),
      }))
      .sort((a, b) => b.gap - a.gap)
  }
}

export const generateCandidateReport = ReportGenerator.generateCandidateReport
