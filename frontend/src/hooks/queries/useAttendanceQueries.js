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
