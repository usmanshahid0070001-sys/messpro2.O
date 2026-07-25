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
