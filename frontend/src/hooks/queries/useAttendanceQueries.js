import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const useGetAttendance = (hostelId, date, mealType) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['attendance', hostelId, date, mealType],
    queryFn: async () => {
      const response = await api.get('/api/attendance', {
        params: { hostelId, date, mealType }
      });
      return response.data;
    },
    enabled: !!hostelId && !!date && !!mealType && !!user,
  });
};

export const useGetManagerQR = () => {
  return useQuery({
    queryKey: ['managerQR'],
    queryFn: async () => {
      const response = await api.get('/api/attendance/qr/generate');
      return response.data;
    },
    staleTime: Infinity, // QR token is valid for 1 year, no need to refetch often
  });
};

export const useGetLiveQRAttendance = () => {
  return useQuery({
    queryKey: ['liveQRAttendance'],
    queryFn: async () => {
      const response = await api.get('/api/attendance/qr/live');
      return response.data;
    }
  });
};

export const useGetStudentSelections = (startDate, endDate) => {
  return useQuery({
    queryKey: ['studentSelections', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/api/attendance/selections', {
        params: { startDate, endDate }
      });
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};
