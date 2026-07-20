import axios from 'axios';
import toast from 'react-hot-toast';

// ─── BASE URL CONFIGURATION ─────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : `http://${window.location.hostname}:5000`);

// ─── AXIOS INSTANCE ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ─── REQUEST INTERCEPTOR ────────────────────────────────────────────────────
// Attach the saved JWT token as a Bearer header on every request.
// This is the primary auth transport — it works even when the browser
// blocks cross-site cookies (Edge, iOS Safari, Android Chrome).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
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
      localStorage.removeItem("authToken");

      if (window.location.pathname !== '/' && !isNavigating) {
        isNavigating = true;
        toast.error("Session expired. Please log in again.");
        window.location.href = '/';
      }
    }

    if (status === 403 && !isVerifyCall) {
      toast.error("You do not have permission to perform this action.");
    }

    return Promise.reject(error);
  }
);

export default api;
