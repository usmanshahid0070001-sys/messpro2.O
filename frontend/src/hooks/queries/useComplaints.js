import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

export const useStudentComplaints = () => {
  return useQuery({
    queryKey: ['student-complaints'],
    queryFn: async () => {
      const response = await api.get('/api/complaints/student');
      return response.data;
    },
  });
};

export const useComplaints = (statusFilter = 'All') => {
  return useQuery({
    queryKey: ['complaints', statusFilter],
    queryFn: async () => {
      const response = await api.get('/api/complaints', {
        params: { status: statusFilter },
      });
      return response.data;
    },
  });
};
