import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// Placeholder slice for future global data (e.g., user settings, notifications)
const appSlice = createSlice({
  name: 'app',
  initialState: {
    isInitialized: true,
  },
  reducers: {
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setInitialized } = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});
