import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

const fetchMyHostel = async () => {
  const response = await apiClient.get('/hostels/my-hostel');
  // API returns { success: true, data: hostelObject } — unwrap the inner data
  return response.data.data;
};

export const useGetMyHostel = (role: string | undefined) => {
  return useQuery({
    queryKey: ['myHostel'],
    queryFn: fetchMyHostel,
    // Only run this query if the user is logged in AND is not a superadmin
    enabled: !!role && role !== 'superadmin',
  });
};
