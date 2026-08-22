import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface AttendanceRecord {
  _id: string;
  hostelId: string;
  date: string;
  mealType: string;
  mealInfo?: {
    name: string;
    price: number;
  };
  rollNumber: string;
  studentId?: {
    _id: string;
    name: string;
    email: string;
    id: string;
    role: string;
  } | null;
  isGuest?: boolean;
  selection?: {
    hasSelected: boolean;
    count: number;
  };
  attendance?: {
    hasEaten: boolean;
    count: number;
    recordedBy?: string;
    method?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceResponse {
  status: string;
  results: number;
  data: AttendanceRecord[];
}

export const useGetAttendance = (
  hostelId?: string,
  date?: string,
  mealType?: string,
  enabled: boolean = true
) => {
  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', hostelId, date, mealType],
    queryFn: async () => {
      if (!hostelId || !date || !mealType) return [];
      const { data } = await apiClient.get<AttendanceResponse>(
        `/attendance?hostelId=${encodeURIComponent(hostelId)}&date=${encodeURIComponent(date)}&mealType=${encodeURIComponent(mealType)}`
      );
      return data.data || [];
    },
    enabled: Boolean(hostelId && date && mealType && enabled),
    staleTime: 1000 * 30, // 30 seconds
  });
};

// ── 1. Manager QR Fortress Token ───────────────────────────────────────────
export interface ManagerQRSecretData {
  h: string; // hostel ID
  s: string; // 8-char secure secret string
}

export const useGetManagerQR = (enabled: boolean = true) => {
  return useQuery<ManagerQRSecretData>({
    queryKey: ['managerQR'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ status: string; data: ManagerQRSecretData }>(
        '/attendance/qr/generate'
      );
      return data.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ── 2. Live QR Attendance Feed ─────────────────────────────────────────────
export interface LiveStudentAttendanceItem {
  name: string;
  rollNumber: string;
  isGuest: boolean;
  attendanceCount: number;
  selectionCount: number;
  hasAttended: boolean;
  isSelected: boolean;
}

export interface LiveMealTypeData {
  summary: {
    totalSelections: number;
    totalAttendance: number;
  };
  data: LiveStudentAttendanceItem[];
}

export interface LiveQRAttendanceData {
  date: string;
  currentMeal: string;
  mealTypes: string[];
  data: Record<string, LiveMealTypeData>;
}

export const useGetLiveQRAttendance = (date?: string, enabled: boolean = true) => {
  return useQuery<LiveQRAttendanceData>({
    queryKey: ['liveQRAttendance', date],
    queryFn: async () => {
      const queryParam = date ? `?date=${encodeURIComponent(date)}` : '';
      const { data } = await apiClient.get<{ status: string; data: LiveQRAttendanceData }>(
        `/attendance/qr/live${queryParam}`
      );
      return data.data;
    },
    enabled,
    refetchInterval: 1000 * 5, // Auto-poll every 5 seconds for live dining counter
  });
};

// ── 3. Daily Attendance Overview ──────────────────────────────────────────
export interface DailyOverviewData {
  date: string;
  mealTypes: string[];
  data: Record<string, LiveMealTypeData>;
}

export const useGetDailyOverview = (date?: string, enabled: boolean = true) => {
  return useQuery<DailyOverviewData>({
    queryKey: ['dailyOverview', date],
    queryFn: async () => {
      const queryParam = date ? `?date=${encodeURIComponent(date)}` : '';
      const { data } = await apiClient.get<{ status: string; data: DailyOverviewData }>(
        `/attendance/daily-overview${queryParam}`
      );
      return data.data;
    },
    enabled,
    staleTime: 1000 * 60, // 1 minute
  });
};
