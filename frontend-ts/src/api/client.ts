import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/AuthSlice';
import { clearHostel } from '../store/slices/HostelSlice';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
  withCredentials: true, // Required to send/receive the HTTP-only auth cookies
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request Interceptor: Attach token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth-related URLs that are allowed to return 401 without triggering a global logout.
// A 401 from /auth/verify on cold-start simply means no session exists — that's expected.
// A 401 from /auth/login means wrong credentials — the mutation handles it locally.
const AUTH_ROUTE_PREFIXES = ['/auth/verify', '/auth/login', '/auth/logout', '/auth/google'];

const isAuthRoute = (url: string | undefined): boolean =>
  AUTH_ROUTE_PREFIXES.some((prefix) => url?.includes(prefix));

// Response Interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    import('sonner').then(({ toast }) => {
      if (!error.response) {
        // Network Error (server down or no connection)
        toast.error('Network Error', {
          description: 'Unable to connect to the server. Please check your connection.',
        });
      } else {
        const { status } = error.response;
        const url = error.config?.url as string | undefined;

        if (status === 401 && !isAuthRoute(url)) {
          // Only dispatch logout for 401s from protected API routes.
          // Auth-route 401s (verify, login) are expected and handled by their own hooks.
          store.dispatch(logout());
          store.dispatch(clearHostel());
        } else if (status >= 500) {
          toast.error('Server Error', {
            description: 'Something went wrong on our end. Please try again later.',
          });
        } else if (status === 403) {
          toast.error('Access Denied', {
            description: 'You do not have permission to perform this action.',
          });
        }
        // 400 and 404 are handled specifically by the mutations/queries
      }
    });

    return Promise.reject(error);
  }
);

export default apiClient;
