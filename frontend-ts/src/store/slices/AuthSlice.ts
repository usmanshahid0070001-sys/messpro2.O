import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  id: string; // The custom string ID
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'manager' | 'student';
  hostelId?: string;
  hostelStatus?: any; // You can type this more strictly if you know the status shape
  permissions?: string[];
  room?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

const getStoredAuth = (): { token: string | null; user: User | null; isAuthenticated: boolean } => {
  try {
    if (typeof window === 'undefined') {
      return { token: null, user: null, isAuthenticated: false };
    }
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? (JSON.parse(userStr) as User) : null;
    return {
      token: token || null,
      user: user || null,
      isAuthenticated: Boolean(token && user),
    };
  } catch (e) {
    return { token: null, user: null, isAuthenticated: false };
  }
};

const storedAuth = getStoredAuth();

const initialState: AuthState = {
  isAuthenticated: storedAuth.isAuthenticated,
  user: storedAuth.user,
  token: storedAuth.token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      try {
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      } catch (e) {
        console.warn('Could not save auth credentials to localStorage', e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        console.warn('Could not clear auth credentials from localStorage', e);
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

