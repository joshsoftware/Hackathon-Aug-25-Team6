// Mock data for development and demo purposes
import type { User, JobDescription, Application } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "john.candidate@email.com",
    name: "John Candidate",
    role: "candidate",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    email: "sarah.recruiter@company.com",
    name: "Sarah Recruiter",
    role: "recruiter",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    email: "admin@company.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockJobs: JobDescription[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    description: "We are looking for a Senior Frontend Developer to join our dynamic team...",
    requirements: [
      "5+ years of React experience",
      "Strong TypeScript skills",
      "Experience with Next.js",
      "Knowledge of state management (Redux/Zustand)",
    ],
    skills: ["React", "TypeScript", "Next.js", "CSS", "JavaScript"],
    experience: "5+ years",
    location: "Remote",
    salary: "$120,000 - $150,000",
    recruiterId: "2",
    isActive: true,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    description: "Join our fast-growing startup as a Full Stack Engineer...",
    requirements: [
      "3+ years of full-stack development",
      "Node.js and React experience",
      "Database design skills",
      "API development experience",
    ],
    skills: ["React", "Node.js", "PostgreSQL", "REST APIs", "Docker"],
    experience: "3+ years",
    location: "San Francisco, CA",
    salary: "$100,000 - $130,000",
    recruiterId: "2",
    isActive: true,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
]

export const mockApplications: Application[] = [
  {
    id: "1",
    candidateId: "1",
    jobId: "1",
    cvUrl: "/mock-cv.pdf",
    cvText:
      "John Candidate - Senior Frontend Developer with 6 years of experience in React, TypeScript, and modern web technologies...",
    status: "screening",
    score: 85,
    readyForNextRound: true,
    createdAt: new Date("2024-01-22"),
    updatedAt: new Date("2024-01-23"),
  },
]

// Mock authentication state
export let currentUser: User | null = null

export const mockAuth = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)
    if (user && password === "password123") {
      currentUser = user
      return user
    }
    return null
  },

  logout: async (): Promise<void> => {
    currentUser = null
  },

  getCurrentUser: (): User | null => {
    return currentUser
  },

  register: async (
    email: string,
    password: string,
    name: string,
    role: "candidate" | "recruiter",
  ): Promise<User | null> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockUsers.push(newUser)
    currentUser = newUser
    return newUser
  },
}
