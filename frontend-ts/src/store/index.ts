import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/AuthSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // other slices can go here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
