import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../api/endpoints/student.api';

export const useWeeklySelections = (dates) => {
  return useQuery({
    queryKey: ['weeklySelections', dates],
    queryFn: () => studentApi.getWeeklySelections(dates),
    enabled: !!dates && dates.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMenuSchedule = () => {
  return useQuery({
    queryKey: ['weeklyMenuSchedule'],
    queryFn: () => studentApi.getMenuSchedule(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useMealHistory = (year, month) => {
  return useQuery({
    queryKey: ['mealHistory', year, month],
    queryFn: () => studentApi.getMealHistory(year, month),
    enabled: !!year && !!month,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMonthlyBill = (month) => {
  return useQuery({
    queryKey: ['monthlyBill', month],
    queryFn: () => studentApi.getMonthlyBill(month),
    enabled: !!month,
    staleTime: 5 * 60 * 1000,
  });
};
