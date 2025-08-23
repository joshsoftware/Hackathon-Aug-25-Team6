"use client"
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/app/(auth)/axiosInstance";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

const JOB_API = {
    CREATEJOB: "/jobs",
    GETJOBSBYID: "/jobs/",
    GETLISTOFJOBS: "/jobs",
    DELETEJOB: "/deletejob",
};

export interface ICreateJobPayload {
    location: string;
    title: string;
    company: string;
    experience: string;
    job_overview: string;
    key_responsibilities: string;
    job_type: string;
    good_to_have_skills: string;
    must_have_skills: string;
}

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


export const useCreateJob = () => {
    const router = useRouter();

    const { mutate, isError, isPending, isSuccess } = useMutation({
        mutationKey: ['createjob'],
        
        mutationFn: async (payload: ICreateJobPayload) => {
            const response = await axiosInstance.post<any>( JOB_API.CREATEJOB, payload);
            return response.data;
        },

        onSuccess: (response) => {
            toast.success(response.message || "Job created successfully",);

            router.push('/recruiter/jobs')
        },

        onError: (response: any) => {
            const errorMessage = (response.detail as { error_msg: string })?.error_msg || 'Sign up failed';

            toast.error(errorMessage);
        }
    });

    return {
    createJobMutation: mutate,
    isJobError: isError,
    isJobPending: isPending,
    isJobSuccess: isSuccess
    };
};


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
                    toast.error("Your session has expired. Please log in again.");
                    localStorage.clear()
                    // router.push('/')
                }
                
                toast.error(error?.detail || "Failed to fetch jobs");
                throw error;
            }
        }
    });
};

export const useGetJobById = (jobId: string) => {
    const router = useRouter();
    
    return useQuery<IJob, Error>({
        queryKey: ['getjobByJobID', jobId],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`${JOB_API.GETLISTOFJOBS}/${jobId}`);
                
                const job = response.data;
                return {
                    ...job,
                    must_have_skills: job.must_have_skills
                        ? job.must_have_skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : [],
                    good_to_have_skills: job.good_to_have_skills
                        ? job.good_to_have_skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : [],
                };
            } catch (error: any) {
                if(error.status === 401){
                    toast.error("Please Log in Again");
                    localStorage.clear()
                    router.push('/')
                }
                
                toast.error(error?.detail || "Failed to fetch job");
                throw error;
            }
        },
        enabled: !!jobId,
    });
};