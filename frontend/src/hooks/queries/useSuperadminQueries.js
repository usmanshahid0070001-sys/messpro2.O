import { useQuery } from '@tanstack/react-query';
import { superadminApi } from '../../api/endpoints/superadmin.api';

export const useHostels = () => {
  return useQuery({
    queryKey: ['superadmin', 'hostels'],
    queryFn: superadminApi.getHostels
  });
};
