// Mock authentication utilities
export interface User {
  id: string
  email: string
  name: string
  role: "candidate" | "hr"
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
    role: "hr",
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

export const getCurrentUser = (): { user: User | null; authToken: string | null } => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("userDetails");
    const token = localStorage.getItem("token");
    let user: User | null = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        user = null;
      }
    }
    return { user, authToken: token };
  }
  return { user: null, authToken: null };
};