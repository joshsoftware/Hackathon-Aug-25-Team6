"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/app/(auth)/axiosInstance";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const JOB_APPLICATION_API = {
    APPLY: "/apply",
    GET_MY_APPLICATIONS: "/applications",
};

export interface IJobApplicationCreate {
    job_id: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    email?: string;
    experience_years?: number;
    experience_months?: number;
    current_city?: string;
    gender?: string;
    cover_letter?: string;
    prescreening_answers?: Record<string, string>;
}

export interface IJobApplicationResponse {
    id: string;
    job_id: string;
    email: string;
    resume_path: string;
    cover_letter?: string;
    prescreening_answers?: Record<string, string>;
    message: string;
}

export const useApplyForJob = () => {
    const router = useRouter();

    const { mutate, isError, isPending, isSuccess } = useMutation({
        mutationKey: ['applyForJob'],
        
        mutationFn: async (formData: FormData) => {
            // Get user details from localStorage
            const userDetailsStr = localStorage.getItem('userDetails');
            const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : {};
            
            // Extract job_id from formData if it exists
            const jobId = formData.get('job_id') as string;
            
            // Create query parameters object
            const queryParams = new URLSearchParams();
            
            // Add job_id
            queryParams.append('job_id', jobId);
            
            // Add user details that we have
            if (userDetails.firstName) {
                queryParams.append('first_name', userDetails.firstName);
            } else {
                queryParams.append('first_name', 'Candidate'); // Default value
            }
            
            if (userDetails.email) {
                queryParams.append('email', userDetails.email);
            }
            
            // Hardcode other values as requested
            queryParams.append('middle_name', 'Middle');
            queryParams.append('last_name', userDetails.lastName || 'User');
            queryParams.append('experience_years', '1');
            queryParams.append('experience_months', '1');
            queryParams.append('current_city', 'pune');
            queryParams.append('gender', 'male');
            
            // Build the URL with all query parameters
            const url = `${JOB_APPLICATION_API.APPLY}?${queryParams.toString()}`;
            
            // Remove job_id from formData as it's now in the URL
            const newFormData = new FormData();
            
            // Add only the resume file to formData
            const resumeFile = formData.get('resume');
            if (resumeFile) {
                newFormData.append('resume', resumeFile);
            }
            
            const response = await axiosInstance.post<IJobApplicationResponse>(
                url,
                newFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        },
        
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.detail || 
                error?.response?.data?.error_msg || 
                'Failed to submit application';
            toast.error(errorMessage);
        },
    });

    return {
        applyForJobMutation: mutate,
        isApplyError: isError,
        isApplyPending: isPending,
        isApplySuccess: isSuccess,
    };
};

// Hook to get user's applications
export const useGetMyApplications = () => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['myApplications'],
        queryFn: async () => {
            const response = await axiosInstance.get(JOB_APPLICATION_API.GET_MY_APPLICATIONS);
            return response.data;
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.detail || 
                                'Failed to fetch your applications.';
            toast.error(errorMessage);
        }
    });

    return {
        applications: data,
        isLoadingApplications: isLoading,
        isErrorApplications: isError,
        refetchApplications: refetch
    };
};