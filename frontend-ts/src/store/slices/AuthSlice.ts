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

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
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
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
