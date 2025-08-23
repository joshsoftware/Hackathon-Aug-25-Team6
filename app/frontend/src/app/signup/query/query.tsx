import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/app/(auth)/axiosInstance";
import { toast } from "react-toastify";

const AUTH_API = {
    SIGNUP: "/signup",
    LOGIN: "/login",
    LOGOUT: "/logout"
};

interface ISignUpPayload {
    email: string;
    name: string;
    password: string;
    role: "candidate" | "hr";
}

interface ILoginPayload {
    email: string;
    password: string;
}

interface IAuthResponse {
    message: string;
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

interface ILoginResponse {
    access_token: string;
    token_type: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: "candidate" | "hr";
        message: string;
    };
}


export const useSignUp = () => {
    // const toast = useToast();
    const router = useRouter();

    const { mutate, isError, isPending, isSuccess } = useMutation({
        mutationKey: ['signup'],
        
        mutationFn: async (payload: ISignUpPayload) => {
            const response = await axiosInstance.post<IAuthResponse>(AUTH_API.SIGNUP, payload);
            return response.data;
        },

        onSuccess: (response) => {
            toast.success('Sign up successful!')

            router.push('/')
        },
        
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { error_msg: string })?.error_msg || 'Sign up failed';
            toast.error(errorMessage);
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
    const router = useRouter();

    const { mutate, isError, isPending, isSuccess } = useMutation({
        mutationKey: ['login'],
        mutationFn: (payload: ILoginPayload) => 
            axiosInstance.post<ILoginResponse>(AUTH_API.LOGIN, payload, { withCredentials: true }),
        onSuccess: (response) => {
            const { access_token, user, token_type } = response.data;
            
            const capitalizedTokenType = token_type.charAt(0).toUpperCase() + token_type.slice(1);

            // Store token
            localStorage.setItem('token', `${capitalizedTokenType} ${access_token}`);
            localStorage.setItem('userDetails', JSON.stringify(user))
            
            toast.success("You've successfully logged in.");

            // Redirect based on role
            if (user.role === 'hr') {
                router.push('/recruiter/dashboard');
            } else {
                router.push('/candidate/dashboard');
            }
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { error_msg: string })?.error_msg || 'Login failed';
            toast.error(errorMessage);
        }
    });

    return {
        loginMutation: mutate,
        isLoginError: isError,
        isLoginPending: isPending,
        isLoginSuccess: isSuccess
    };
};
