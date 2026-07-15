import { useQuery } from '@tanstack/react-query';
import { miscApi } from '../../api/endpoints/misc.api';
import { mealApi } from '../../api/endpoints/meal.api';
import { billingApi } from '../../api/endpoints/billing.api';

export const useDailyCounts = (date) => {
  return useQuery({
    queryKey: ['dailyCounts', date],
    queryFn: () => miscApi.getDailyCounts(date),
    refetchInterval: 30000,
    staleTime: 1000 * 30,
    enabled: !!date,
  });
};

export const useMenuSchedule = () => {
  return useQuery({
    queryKey: ['menuSchedule'],
    queryFn: () => mealApi.getMenu(),
  });
};

export const useAllBills = () => {
  return useQuery({
    queryKey: ['allBills'],
    queryFn: () => billingApi.getAllBills(),
  });
};
