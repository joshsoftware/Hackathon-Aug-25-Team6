// Mock authentication utilities
export interface User {
  id: string
  email: string
  name: string
  role: "candidate" | "recruiter"
  avatar?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock user data
export const mockUsers: Record<string, User> = {
  "recruiter@company.com": {
    id: "1",
    email: "recruiter@company.com",
    name: "Sarah Johnson",
    role: "recruiter",
    avatar: "/professional-woman-diverse.png",
  },
  "candidate@email.com": {
    id: "2",
    email: "candidate@email.com",
    name: "John Smith",
    role: "candidate",
    avatar: "/professional-man.png",
  },
}

export const getCurrentUser = (): User | null => {
  // Mock implementation - in real app, this would check JWT/session
  if (typeof window !== "undefined") {
    const userType = window.location.pathname.includes("recruiter") ? "recruiter" : "candidate"
    return userType === "recruiter" ? mockUsers["recruiter@company.com"] : mockUsers["candidate@email.com"]
  }
  return null
}

export const logout = () => {
  // Mock logout - redirect to login
  window.location.href = "/"
}
