import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/AuthSlice';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
  withCredentials: true, // Required to send/receive the HTTP-only auth cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can import toast directly from sonner
    import('sonner').then(({ toast }) => {
      if (!error.response) {
        // Network Error (server down or no connection)
        toast.error('Network Error', {
          description: 'Unable to connect to the server. Please check your connection.',
        });
      } else {
        const { status, data } = error.response;
        if (status === 401) {
          store.dispatch(logout());
        } else if (status >= 500) {
          toast.error('Server Error', {
            description: 'Something went wrong on our end. Please try again later.',
          });
        } else if (status === 403) {
          toast.error('Access Denied', {
            description: 'You do not have permission to perform this action.',
          });
        }
        // 400 and 404 can be handled specifically by the mutations/queries
      }
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;
