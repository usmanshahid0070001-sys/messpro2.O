import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

export const useGetTargettedUsers = () => {
  return useQuery({
    queryKey: ['targettedUsers'],
    queryFn: async () => {
      const response = await api.get('/api/users');
      return response.data.data;
    },
  });
};

export const useGetHostelDetails = (role) => {
  return useQuery({
    queryKey: ['hostelDetails', role],
    queryFn: async () => {
      // Superadmin needs a list of all hostels to choose from when creating users
      if (role === 'superadmin') {
        const response = await api.get('/api/hostels');
        return response.data.data;
      } else {
        // Admin, Manager, Student get their own hostel
        const response = await api.get('/api/hostels/my-hostel');
        return response.data.data;
      }
    },
    // Cache the data indefinitely as it rarely changes (or we invalidate it when needed)
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
