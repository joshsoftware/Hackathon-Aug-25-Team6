import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useToast } from "@/app/(components)/ui/use-toast";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/app/(auth)/axiosInstance";

const JOB_API = {
    CREATEJOB: "/createjob",
    GETJOBSBYID: "/getsinglejob",
    GETLISTOFJOBS: "/getjobs",
    DELETEJOB: "/deletejob",
};

interface ICreateJobPayload {
    location: string;
    title: string;
    company: string;
    experience: string;
    job_overview: string;
    key_responsibilities: string;
    primary_skills: string;
    qualifications: string;
    good_to_have_skills: string;
}

export const useCreateJob = () => {
    const toast = useToast();
    const router = useRouter();

    const { mutate, isError, isPending, isSuccess } = useMutation({
        mutationKey: ['createjob'],
        
        mutationFn: async (payload: ICreateJobPayload) => {
            const response = await axiosInstance.post<any>( JOB_API.CREATEJOB, payload);
            return response.data;
        },

        onSuccess: (response) => {
            toast.toast({
                title: "Job created!",
                description: response.message || "Job created successfully",
                variant: "default",
            });

            router.push('/recruiter/jobs')
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { error_msg: string })?.error_msg || 'Sign up failed';
            toast.toast({
                title: "Error!",
                description: errorMessage,
                variant: "destructive",
            });
        }
    });

    return {
    createJobMutation: mutate,
    isJobError: isError,
    isJobPending: isPending,
    isJobSuccess: isSuccess
    };
};

//     const toast = useToast();
//     const router = useRouter();

//     const { mutate, isError, isPending, isSuccess } = useMutation({
//         mutationKey: ['login'],
//         mutationFn: (payload: ILoginPayload) => 
//             axios.post<IAuthResponse>(AUTH_API.LOGIN, payload, { withCredentials: true }),
//         onSuccess: (response) => {
//             const { access_token, user } = response.data;
            
//             // Store token
//             localStorage.setItem('token', access_token);
            
//             toast.toast({
//                 title: "Welcome back!",
//                 description: "You've successfully logged in.",
//                 variant: "default",
//             });

//             // Redirect based on role
//             if (user.role === 'recruiter') {
//                 router.push('/recruiter/dashboard');
//             } else {
//                 router.push('/candidate/dashboard');
//             }
//         },
//         onError: (error: AxiosError) => {
//             const errorMessage = (error.response?.data as { error_msg: string })?.error_msg || 'Login failed';
//             toast.toast({
//                 title: "Error!",
//                 description: errorMessage,
//                 variant: "destructive",
//             });
//         }
//     });

//     return {
//         loginMutation: mutate,
//         isLoginError: isError,
//         isLoginPending: isPending,
//         isLoginSuccess: isSuccess
//     };
// };

// export const useLogout = () => {
//     const toast = useToast();
//     const router = useRouter();

//     const { mutate, isError, isPending, isSuccess } = useMutation({
//         mutationKey: ['logout'],
//         mutationFn: () => axios.post(AUTH_API.LOGOUT, {}, { withCredentials: true }),
//         onSuccess: () => {
//             localStorage.removeItem('token');
            
//             toast.toast({
//                 title: "Logged out",
//                 description: "You've been successfully logged out.",
//                 variant: "default",
//             });

//             // Redirect to login
//             router.push('/');
//         },
//         onError: (error: AxiosError) => {
//             const errorMessage = (error.response?.data as { error_msg: string })?.error_msg || 'Logout failed';
//             toast.toast({
//                 title: "Error!",
//                 description: errorMessage,
//                 variant: "destructive",
//             });
//         }
//     });

//     return {
//         logoutMutation: mutate,
//         isLogoutError: isError,
//         isLogoutPending: isPending,
//         isLogoutSuccess: isSuccess
//     };
// };