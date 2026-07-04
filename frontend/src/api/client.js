import axios from 'axios';
import toast from 'react-hot-toast';

// ─── BASE URL CONFIGURATION ─────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");

// ─── AXIOS INSTANCE ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ─── REQUEST INTERCEPTOR ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────
let isNavigating = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Exempt the verify endpoint — AuthContext handles its own 401 logic
    const isVerifyCall = requestUrl.includes("/api/auth/verify");

    if (status === 401 && !isVerifyCall) {
      localStorage.removeItem("userInfo");

      if (window.location.pathname !== '/login' && !isNavigating) {
        isNavigating = true;
        toast.error("Session expired. Please log in again.");
        window.location.href = '/login';
      }
    }

    if (status === 403 && !isVerifyCall) {
      toast.error("You do not have permission to perform this action.");
    }

    return Promise.reject(error);
  }
);

export default api;
