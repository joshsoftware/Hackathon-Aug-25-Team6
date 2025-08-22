import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useToast } from "@/app/(components)/ui/use-toast";
import { useRouter } from "next/navigation";

const AUTH_API = {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout"
};

interface ISignUpPayload {
    email: string;
    name: string;
    password: string;
    role: "candidate" | "recruiter";
}

interface ILoginPayload {
    email: string;
    password: string;
}

interface IAuthResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export const useSignUp = () => {
    const toast = useToast();
    const router = useRouter();

    const { mutate, isError, isPending, isSuccess } = useMutation({
        mutationKey: ['signup'],
        
        mutationFn: (payload: ISignUpPayload) => 
            axios.post<IAuthResponse>(AUTH_API.SIGNUP, payload, { withCredentials: true }),

        onSuccess: (response) => {
            const { access_token, user } = response.data;
            
            localStorage.setItem('token', access_token);
            
            toast.toast({
                title: "Account created!",
                description: "Your account has been created successfully!",
                variant: "default",
            });

            // Redirect based on role
            if (user.role === 'recruiter') {
                router.push('/recruiter/dashboard');
            } else {
                router.push('/candidate/dashboard');
            }
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
        signUpMutation: mutate,
        isSignUpError: isError,
        isSignUpPending: isPending,
        isSignUpSuccess: isSuccess
    };
};

export const useLogin = () => {
    const toast = useToast();
    const router = useRouter();

    const { mutate, isError, isPending, isSuccess } = useMutation({
        mutationKey: ['login'],
        mutationFn: (payload: ILoginPayload) => 
            axios.post<IAuthResponse>(AUTH_API.LOGIN, payload, { withCredentials: true }),
        onSuccess: (response) => {
            const { access_token, user } = response.data;
            
            // Store token
            localStorage.setItem('token', access_token);
            
            toast.toast({
                title: "Welcome back!",
                description: "You've successfully logged in.",
                variant: "default",
            });

            // Redirect based on role
            if (user.role === 'recruiter') {
                router.push('/recruiter/dashboard');
            } else {
                router.push('/candidate/dashboard');
            }
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { error_msg: string })?.error_msg || 'Login failed';
            toast.toast({
                title: "Error!",
                description: errorMessage,
                variant: "destructive",
            });
        }
    });

    return {
        loginMutation: mutate,
        isLoginError: isError,
        isLoginPending: isPending,
        isLoginSuccess: isSuccess
    };
};

export const useLogout = () => {
    const toast = useToast();
    const router = useRouter();

    const { mutate, isError, isPending, isSuccess } = useMutation({
        mutationKey: ['logout'],
        mutationFn: () => axios.post(AUTH_API.LOGOUT, {}, { withCredentials: true }),
        onSuccess: () => {
            localStorage.removeItem('token');
            
            toast.toast({
                title: "Logged out",
                description: "You've been successfully logged out.",
                variant: "default",
            });

            // Redirect to login
            router.push('/');
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { error_msg: string })?.error_msg || 'Logout failed';
            toast.toast({
                title: "Error!",
                description: errorMessage,
                variant: "destructive",
            });
        }
    });

    return {
        logoutMutation: mutate,
        isLogoutError: isError,
        isLogoutPending: isPending,
        isLogoutSuccess: isSuccess
    };
};