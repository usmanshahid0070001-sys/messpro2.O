import { useQuery } from '@tanstack/react-query';
import {
  studentGetWeeklySelections,
  studentGetMealSchedule,
  studentGetHistory,
  studentGetMonthlyBill,
  studentGetMealTimings,
} from '../../api/endpoints/student.api';

// ─── STUDENT QUERY HOOKS ────────────────────────────────────────────────────

export const useWeeklySelections = (dates) => {
  return useQuery({
    queryKey: ['weeklySelections', dates],
    queryFn: () => studentGetWeeklySelections(dates),
    enabled: !!dates,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMenuSchedule = () => {
  return useQuery({
    queryKey: ['weeklyMenuSchedule'],
    queryFn: studentGetMealSchedule,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useMealHistory = (year, month) => {
  return useQuery({
    queryKey: ['mealHistory', year, month],
    queryFn: () => studentGetHistory({ year, month }),
    enabled: year != null && month != null,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMonthlyBill = (month) => {
  return useQuery({
    queryKey: ['monthlyBill', month],
    queryFn: () => studentGetMonthlyBill(month),
    enabled: !!month,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMealTimings = () => {
  return useQuery({
    queryKey: ['mealTimings'],
    queryFn: studentGetMealTimings,
  });
};
