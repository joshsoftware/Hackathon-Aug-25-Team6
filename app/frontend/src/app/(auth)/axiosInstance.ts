import axios from "axios";

// Base axios instance
export const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

