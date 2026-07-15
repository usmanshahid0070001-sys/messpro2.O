import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../api/endpoints/user.api';
import { mealApi } from '../../api/endpoints/meal.api';
import { billingApi } from '../../api/endpoints/billing.api';
import { miscApi } from '../../api/endpoints/misc.api';

// ─── ADMIN QUERY HOOKS ──────────────────────────────────────────────────────

export const useAdminStudents = () => {
  return useQuery({
    queryKey: ['adminStudents'],
    queryFn: userApi.getUsers, // Now maps to /api/users
  });
};

export const useAdminDashboardStats = (month) => {
  return useQuery({
    queryKey: ['adminDashboardStats', month],
    queryFn: () => miscApi.getDashboardStats(month),
    enabled: !!month,
  });
};

export const useMachineAttendanceCounts = (month) => {
  return useQuery({
    queryKey: ['machineAttendance', month],
    queryFn: () => miscApi.getDailyCounts(month), // Fallback to counts or add to misc
    enabled: !!month,
  });
};

export const useMealPrices = (month) => {
  return useQuery({
    queryKey: ['mealPrices', month],
    queryFn: () => mealApi.getMealSettings(month), // Fallback
    enabled: !!month,
  });
};

export const useMealSettings = () => {
  return useQuery({
    queryKey: ['mealSettings'],
    queryFn: mealApi.getMealSettings,
  });
};

export const useAdminMenu = () => {
  return useQuery({
    queryKey: ['adminMenu'],
    queryFn: mealApi.getMenu,
  });
};

export const useAdminMenuDefaults = () => {
  return useQuery({
    queryKey: ['adminMenuDefaults'],
    queryFn: mealApi.getMenu,
  });
};

export const useAdminBillSummary = (month) => {
  return useQuery({
    queryKey: ['adminBillSummary', month],
    queryFn: () => billingApi.getAllBills(), // Fallback
    enabled: !!month,
  });
};

export const useMealViolations = (month) => {
  return useQuery({
    queryKey: ['mealViolations', month],
    queryFn: () => mealApi.getMealHistory(month), // Fallback
    enabled: !!month,
  });
};

export const usePendingBills = (rollNumber) => {
  return useQuery({
    queryKey: ['pendingBills', rollNumber],
    queryFn: () => billingApi.getAllBills(), // Fallback
    enabled: !!rollNumber,
  });
};
