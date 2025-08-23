import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/app/(auth)/axiosInstance";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Types for job application details
export interface IJobApplicationDetail {
  application_id: number;
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  experience: string;
  job_overview: string;
  key_responsibilities: string;
  must_have_skills: string[]; // parsed from comma string
  good_to_have_skills: string[]; // parsed from comma string
  job_type: string;
  recruiter_name: string;
  total_applications: number;
  posted_date: string;
  // Add any status field if available
  status?: string;
}

// Types for candidate (applicant)
export interface ICandidate {
  user_id: number;
  name: string;
  email: string;
  role: string;
  job_applications: IJobApplicationDetail[];
}

export const useGetApplicants = () => {
    const router = useRouter()
    
  return useQuery<ICandidate[], Error>({
    queryKey: ["getApplicants"],
    queryFn: async () => {
    try {
        const response = await axiosInstance.get("/applicants");
        // Parse skills fields for each job application
        return response.data.map((user: any) => ({
        ...user,
        job_applications: user.job_applications.map((app: any) => ({
            ...app,
            must_have_skills: app.must_have_skills
            ? app.must_have_skills.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
            good_to_have_skills: app.good_to_have_skills
            ? app.good_to_have_skills.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
            // Default status if not provided by API
            status: app.status || "pending"
        })),
        }));
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        localStorage.clear();
        router.push('/')
        }
    }
    },
  });
};