import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/AuthSlice';
import hostelReducer from './slices/HostelSlice';
import biometricSyncReducer from './slices/BiometricSyncSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hostel: hostelReducer,
    biometricSync: biometricSyncReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
