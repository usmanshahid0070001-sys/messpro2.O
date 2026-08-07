import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For local development on Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, localhost works fine
// The backend is running on port 5000 according to client.js in frontend
const defaultApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || defaultApiUrl;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isNavigating = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    const isVerifyCall = requestUrl.includes("/api/auth/verify");

    if (status === 401 && !isVerifyCall) {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userInfo');
      
      // In a real app we'd dispatch an event or use a global state to trigger redirect to login.
      // We will handle this in AuthContext as well.
      console.warn("Session expired. Please log in again.");
    }

    if (status === 403 && !isVerifyCall) {
      console.warn("You do not have permission to perform this action.");
    }

    return Promise.reject(error);
  }
);

export default api;
