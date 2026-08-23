import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/AuthSlice';
import hostelReducer from './slices/HostelSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hostel: hostelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
