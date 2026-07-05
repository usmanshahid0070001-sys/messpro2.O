import { useQuery } from '@tanstack/react-query';
import { managerApi } from '../../api/endpoints/manager.api';

export const useDailyCounts = (date) => {
  return useQuery({
    queryKey: ['dailyCounts', date],
    queryFn: () => managerApi.getDailyCounts(date),
    refetchInterval: 30000,
    staleTime: 1000 * 30,
    enabled: !!date,
  });
};

export const useMenuSchedule = () => {
  return useQuery({
    queryKey: ['menuSchedule'],
    queryFn: () => managerApi.getMenu(),
  });
};

export const useAllBills = () => {
  return useQuery({
    queryKey: ['allBills'],
    queryFn: () => managerApi.getAllBills(),
  });
};
