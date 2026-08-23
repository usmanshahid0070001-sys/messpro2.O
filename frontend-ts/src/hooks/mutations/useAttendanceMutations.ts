import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { toast } from 'sonner';

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
      toast.success(res.message || 'Attendance saved successfully!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to save attendance.';
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
        toast.success(res.message || 'Student attendance marked!');
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to process student QR code.';
      toast.error(msg);
    },
  });
};

// ── 3. Manager Respond to Guest / Cross-Hostel Permission ─────────────────
export interface RespondGuestPermissionPayload {
  requestId?: string;
  studentId: string;
  isApproved: boolean;
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
      toast.success(res.message || 'Permission updated successfully!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update guest permission.';
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

export const useProcessBiometricAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<ProcessBiometricResponse, any, ProcessBiometricPayload>({
    mutationFn: async (payload: ProcessBiometricPayload) => {
      const { data } = await apiClient.post<ProcessBiometricResponse>(
        '/attendance/biometric/upload',
        payload
      );
      return data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['liveQRAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['dailyOverview'] });
      toast.success(res.message || 'Biometric attendance synced successfully!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to process biometric file.';
      toast.error(msg);
    },
  });
};
