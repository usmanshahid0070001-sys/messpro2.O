import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';

export const useSaveAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceData) => {
      const response = await api.post('/api/attendance', attendanceData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the attendance query to fetch fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['attendance', variables.hostelId, variables.date, variables.mealType] 
      });
      toast.success('Attendance saved successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    },
  });
};

export const useScanStudentQR = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/attendance/qr/scan-student', data);
      return response.data; // Can be success or requires_permission
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to scan QR code');
    }
  });
};

export const useScanManagerQR = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/attendance/qr/scan-manager', data);
      return response.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to scan QR code');
    }
  });
};

export const useRequestGuestPermission = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/attendance/qr/request-permission', data);
      return response.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to request permission');
    }
  });
};

export const useRespondGuestPermission = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/attendance/qr/respond-permission', data);
      return response.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to respond to permission request');
    }
  });
};
