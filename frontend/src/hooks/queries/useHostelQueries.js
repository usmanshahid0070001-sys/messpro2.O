import { useQuery } from '@tanstack/react-query';
import { hostelApi } from '../../api/endpoints/hostel.api';

export const useMyHostel = () => {
  return useQuery({
    queryKey: ['myHostel'],
    queryFn: hostelApi.getMyHostel,
  });
};
