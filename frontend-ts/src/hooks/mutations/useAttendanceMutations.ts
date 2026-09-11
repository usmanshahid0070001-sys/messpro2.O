import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import { extractApiErrorMessage } from './useHostelMutations';

export interface SaveAttendanceRecordItem {
  rollNumber: string;
  count: number;
}

export interface SaveAttendancePayload {
  hostelId: string;
  date: string;
  mealType: string;
  mealInfo: {
    name: string;
    price: number;
  };
  records: SaveAttendanceRecordItem[];
}

export interface SaveAttendanceResponse {
  status: string;
  message: string;
}

// ── 1. Save Attendance (Manual) ───────────────────────────────────────────
export const useSaveAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<SaveAttendanceResponse, any, SaveAttendancePayload>({
    mutationFn: async (payload: SaveAttendancePayload) => {
      const { data } = await apiClient.post<SaveAttendanceResponse>('/attendance', payload);
      return data;
    },
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', variables.hostelId, variables.date, variables.mealType],
      });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['liveQRAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['dailyOverview'] });
      queryClient.invalidateQueries({ queryKey: ['managerLiveOverview'] });
      queryClient.invalidateQueries({ queryKey: ['studentMonthlyRecords'] });
      toast.success(res.message || 'Attendance saved successfully!');
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to save attendance.');
      toast.error(msg);
    },
  });
};

// ── 2. Manager Scan Student QR Code ───────────────────────────────────────
export interface ScanStudentQRPayload {
  studentRollNumber: string;
}

export interface ScanStudentQRSuccess {
  status: 'success';
  message: string;
  data?: any;
}

export interface ScanStudentQRPermission {
  status: 'requires_permission';
  student: {
    _id: string;
    name: string;
    rollNumber: string;
    hostelId: string;
  };
  message: string;
}

export type ScanStudentQRResponse = ScanStudentQRSuccess | ScanStudentQRPermission;

export const useScanStudentQR = () => {
  const queryClient = useQueryClient();

  return useMutation<ScanStudentQRResponse, any, ScanStudentQRPayload>({
    mutationFn: async (payload: ScanStudentQRPayload) => {
      const { data } = await apiClient.post<ScanStudentQRResponse>(
        '/attendance/qr/scan-student',
        payload
      );
      return data;
    },
    onSuccess: (res) => {
      if (res.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['liveQRAttendance'] });
        queryClient.invalidateQueries({ queryKey: ['dailyOverview'] });
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
        queryClient.invalidateQueries({ queryKey: ['managerLiveOverview'] });
        queryClient.invalidateQueries({ queryKey: ['studentMonthlyRecords'] });
        toast.success(res.message || 'Student attendance marked!');
      }
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to process student QR code.');
      toast.error(msg);
    },
  });
};

// ── 3. Manager Respond to Guest / Cross-Hostel Permission ─────────────────
export interface RespondGuestPermissionPayload {
  requestId?: string;
  studentId: string;
  isApproved: boolean;
  hostelId?: string;
}

export const useRespondGuestPermission = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { status: string; message: string; data?: any },
    any,
    RespondGuestPermissionPayload
  >({
    mutationFn: async (payload: RespondGuestPermissionPayload) => {
      const { data } = await apiClient.post<{ status: string; message: string; data?: any }>(
        '/attendance/qr/respond-permission',
        payload
      );
      return data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['liveQRAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['dailyOverview'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['managerLiveOverview'] });
      queryClient.invalidateQueries({ queryKey: ['studentMonthlyRecords'] });
      toast.success(res.message || 'Permission updated successfully!');
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to update guest permission.');
      toast.error(msg);
    },
  });
};

// ── 4. Biometric Attendance Batch Import ───────────────────────────────────
export interface BiometricAttendanceItem {
  rollNumber: string;
  date: string;
  mealType: string;
  count?: number;
  punchTime?: string;
}

export interface ProcessBiometricPayload {
  records: BiometricAttendanceItem[];
  unrecognizedStudentAction: 'guest' | 'skip';
  duplicatePunchStrategy: 'deduplicate' | 'accumulate';
}

export interface ProcessBiometricResponse {
  success: boolean;
  message: string;
  stats: {
    totalSubmitted: number;
    totalProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    guestsMarked: number;
    skippedCount: number;
  };
}

import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  startSyncProgress,
  updateSyncChunkProgress,
  finishSyncSuccess,
  setSyncError,
  type BiometricSyncStats,
} from '@/store/slices/BiometricSyncSlice';

export const BIOMETRIC_CHUNK_SIZE = 100; // 100 records per HTTP batch

export const useChunkedBiometricSync = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const biometricSyncState = useSelector((state: RootState) => state.biometricSync);

  const startSync = async (params: {
    records: BiometricAttendanceItem[];
    unrecognizedStudentAction: 'guest' | 'skip';
    duplicatePunchStrategy: 'deduplicate' | 'accumulate';
    fileName?: string;
  }) => {
    const {
      records,
      unrecognizedStudentAction,
      duplicatePunchStrategy,
      fileName = 'biometric_data.xlsx',
    } = params;

    if (!records || records.length === 0) {
      toast.error('No biometric records to sync.');
      return;
    }

    // Split records into manageable chunks of BIOMETRIC_CHUNK_SIZE
    const chunks: BiometricAttendanceItem[][] = [];
    for (let i = 0; i < records.length; i += BIOMETRIC_CHUNK_SIZE) {
      chunks.push(records.slice(i, i + BIOMETRIC_CHUNK_SIZE));
    }

    const totalChunks = chunks.length;
    const totalRecords = records.length;

    dispatch(
      startSyncProgress({
        fileName,
        totalRecords,
        totalChunks,
      })
    );

    const aggregated: BiometricSyncStats = {
      totalSubmitted: totalRecords,
      totalProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      guestsMarked: 0,
      skippedCount: 0,
    };

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = chunks[i];
        const payload: ProcessBiometricPayload = {
          records: chunk,
          unrecognizedStudentAction,
          duplicatePunchStrategy,
        };

        const { data } = await apiClient.post<ProcessBiometricResponse>(
          '/attendance/biometric/upload',
          payload
        );

        if (data && data.stats) {
          aggregated.recordsCreated += data.stats.recordsCreated || 0;
          aggregated.recordsUpdated += data.stats.recordsUpdated || 0;
          aggregated.guestsMarked += data.stats.guestsMarked || 0;
          aggregated.skippedCount += data.stats.skippedCount || 0;
          aggregated.totalProcessed += data.stats.totalProcessed || chunk.length;
        } else {
          aggregated.totalProcessed += chunk.length;
        }

        dispatch(
          updateSyncChunkProgress({
            chunkIndex: i,
            chunkRecordsCount: chunk.length,
            chunkStats: data?.stats,
          })
        );
      }

      dispatch(finishSyncSuccess({ finalStats: aggregated }));

      // Invalidate queries so that live counters and dashboards update immediately
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['liveQRAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['dailyOverview'] });
      queryClient.invalidateQueries({ queryKey: ['managerLiveOverview'] });
      queryClient.invalidateQueries({ queryKey: ['studentMonthlyRecords'] });

      toast.success('Biometric Sync Complete', {
        description: `Successfully processed ${totalRecords} records (${aggregated.recordsCreated} created, ${aggregated.recordsUpdated} updated, ${aggregated.guestsMarked} guests).`,
        duration: 8000,
      });

      return aggregated;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to process biometric batch.');
      dispatch(setSyncError(msg));
      toast.error('Biometric Sync Interrupted', {
        description: msg,
        duration: 8000,
      });
      throw err;
    }
  };

  return {
    startSync,
    biometricSyncState,
  };
};
