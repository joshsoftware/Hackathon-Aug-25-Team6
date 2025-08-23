
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/app/(auth)/axiosInstance";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

const JOB_API = {
    GETJOBSBYID: "/getsinglejob",
    GETLISTOFJOBS: "/jobs",
    DELETEJOB: "/deletejob",
};

export interface IJob {
    job_id: string;
    title: string;
    company: string;
    location: string;
    experience: string;
    job_overview: string;
    key_responsibilities: string;
    must_have_skills: string[];
    good_to_have_skills: string[];
    recruiter_id: string;
    recruiter_name: string;
    job_type: string;
    applications_count: number;
    posted_date: string;
}


export const useGetJobs = () => {
    const router = useRouter();
    
    return useQuery<IJob[], Error>({
        queryKey: ['getjobs'],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(JOB_API.GETLISTOFJOBS);

                return response.data.map((job: any) => ({
                    ...job,
                    must_have_skills: job.must_have_skills
                        ? job.must_have_skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : [],
                    good_to_have_skills: job.good_to_have_skills
                        ? job.good_to_have_skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : [],
                }));
            } catch (error: any) {

                if(error.status === 401){
                    toast.error("Please Log in Again");
                    localStorage.clear()
                    router.push('/')
                }
                
                toast.error(error?.detail || "Failed to fetch jobs");
                throw error;
            }
        }
    });
};