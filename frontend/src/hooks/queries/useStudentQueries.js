import { useQuery } from '@tanstack/react-query';
import { mealApi } from '../../api/endpoints/meal.api';
import { billingApi } from '../../api/endpoints/billing.api';

export const useWeeklySelections = (dates) => {
  return useQuery({
    queryKey: ['weeklySelections', dates],
    queryFn: () => mealApi.getWeeklySelections(dates),
    enabled: !!dates && dates.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMenuSchedule = () => {
  return useQuery({
    queryKey: ['weeklyMenuSchedule'],
    queryFn: () => mealApi.getMenuSchedule(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useMealHistory = (year, month) => {
  return useQuery({
    queryKey: ['mealHistory', year, month],
    queryFn: () => mealApi.getMealHistory(year, month),
    enabled: !!year && !!month,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMonthlyBill = (month) => {
  return useQuery({
    queryKey: ['monthlyBill', month],
    queryFn: () => billingApi.getMonthlyBill(month),
    enabled: !!month,
    staleTime: 5 * 60 * 1000,
  });
};
