import { useQuery } from '@tanstack/react-query';
import { hostelApi } from '../../api/endpoints/hostel.api';

export const useHostels = () => {
  return useQuery({
    queryKey: ['superadmin', 'hostels'],
    queryFn: hostelApi.getHostels
  });
};
