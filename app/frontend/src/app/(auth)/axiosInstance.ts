import axios from "axios";

// Base axios instance
export const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});


axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers['Authorization'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
