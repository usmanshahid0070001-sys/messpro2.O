import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface BiometricSyncStats {
  totalSubmitted: number;
  totalProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  guestsMarked: number;
  skippedCount: number;
}

export interface BiometricSyncState {
  isSyncing: boolean;
  fileName: string;
  totalRecords: number;
  processedRecords: number;
  currentChunkIndex: number;
  totalChunks: number;
  progressPct: number;
  aggregatedStats: BiometricSyncStats;
  error: string | null;
  isCompleted: boolean;
  isDismissed: boolean;
}

const initialStats: BiometricSyncStats = {
  totalSubmitted: 0,
  totalProcessed: 0,
  recordsCreated: 0,
  recordsUpdated: 0,
  guestsMarked: 0,
  skippedCount: 0,
};

const initialState: BiometricSyncState = {
  isSyncing: false,
  fileName: '',
  totalRecords: 0,
  processedRecords: 0,
  currentChunkIndex: 0,
  totalChunks: 0,
  progressPct: 0,
  aggregatedStats: initialStats,
  error: null,
  isCompleted: false,
  isDismissed: true,
};

export const biometricSyncSlice = createSlice({
  name: 'biometricSync',
  initialState,
  reducers: {
    startSyncProgress: (
      state,
      action: PayloadAction<{
        fileName: string;
        totalRecords: number;
        totalChunks: number;
      }>
    ) => {
      state.isSyncing = true;
      state.fileName = action.payload.fileName;
      state.totalRecords = action.payload.totalRecords;
      state.totalChunks = action.payload.totalChunks;
      state.processedRecords = 0;
      state.currentChunkIndex = 0;
      state.progressPct = 0;
      state.aggregatedStats = {
        totalSubmitted: action.payload.totalRecords,
        totalProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        guestsMarked: 0,
        skippedCount: 0,
      };
      state.error = null;
      state.isCompleted = false;
      state.isDismissed = false;
    },

    updateSyncChunkProgress: (
      state,
      action: PayloadAction<{
        chunkIndex: number;
        chunkRecordsCount: number;
        chunkStats?: Partial<BiometricSyncStats>;
      }>
    ) => {
      state.currentChunkIndex = action.payload.chunkIndex + 1;
      state.processedRecords = Math.min(
        state.totalRecords,
        state.processedRecords + action.payload.chunkRecordsCount
      );
      state.progressPct =
        state.totalRecords > 0
          ? Math.min(100, Math.round((state.processedRecords / state.totalRecords) * 100))
          : 0;

      if (action.payload.chunkStats) {
        const cs = action.payload.chunkStats;
        state.aggregatedStats.recordsCreated += cs.recordsCreated || 0;
        state.aggregatedStats.recordsUpdated += cs.recordsUpdated || 0;
        state.aggregatedStats.guestsMarked += cs.guestsMarked || 0;
        state.aggregatedStats.skippedCount += cs.skippedCount || 0;
        state.aggregatedStats.totalProcessed += cs.totalProcessed || action.payload.chunkRecordsCount;
      }
    },

    finishSyncSuccess: (
      state,
      action: PayloadAction<{
        finalStats?: BiometricSyncStats;
      }>
    ) => {
      state.isSyncing = false;
      state.isCompleted = true;
      state.progressPct = 100;
      state.processedRecords = state.totalRecords;
      if (action.payload.finalStats) {
        state.aggregatedStats = action.payload.finalStats;
      }
      state.error = null;
    },

    setSyncError: (state, action: PayloadAction<string>) => {
      state.isSyncing = false;
      state.error = action.payload;
    },

    dismissSyncNotification: (state) => {
      state.isDismissed = true;
    },

    resetSyncState: (state) => {
      state.isSyncing = false;
      state.fileName = '';
      state.totalRecords = 0;
      state.processedRecords = 0;
      state.currentChunkIndex = 0;
      state.totalChunks = 0;
      state.progressPct = 0;
      state.aggregatedStats = initialStats;
      state.error = null;
      state.isCompleted = false;
      state.isDismissed = true;
    },
  },
});

export const {
  startSyncProgress,
  updateSyncChunkProgress,
  finishSyncSuccess,
  setSyncError,
  dismissSyncNotification,
  resetSyncState,
} = biometricSyncSlice.actions;

export default biometricSyncSlice.reducer;
