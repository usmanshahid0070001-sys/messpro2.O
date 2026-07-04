import { useQuery } from '@tanstack/react-query';
import {
  adminGetStudents,
  adminGetMachineAttendanceCounts,
  adminGetMealPrices,
  adminGetMealSettings,
  adminGetMenu,
  adminGetMenuDefaults,
  adminGetBillSummary,
  adminGetDashboardStats,
  adminGetMealViolations,
  adminGetPendingBills,
} from '../../api/endpoints/admin.api';

// ─── ADMIN QUERY HOOKS ──────────────────────────────────────────────────────

export const useAdminStudents = () => {
  return useQuery({
    queryKey: ['adminStudents'],
    queryFn: adminGetStudents,
  });
};

export const useAdminDashboardStats = (month) => {
  return useQuery({
    queryKey: ['adminDashboardStats', month],
    queryFn: () => adminGetDashboardStats(month),
    enabled: !!month,
  });
};

export const useMachineAttendanceCounts = (month) => {
  return useQuery({
    queryKey: ['machineAttendance', month],
    queryFn: () => adminGetMachineAttendanceCounts(month),
    enabled: !!month,
  });
};

export const useMealPrices = (month) => {
  return useQuery({
    queryKey: ['mealPrices', month],
    queryFn: () => adminGetMealPrices(month),
    enabled: !!month,
  });
};

export const useMealSettings = () => {
  return useQuery({
    queryKey: ['mealSettings'],
    queryFn: adminGetMealSettings,
  });
};

export const useAdminMenu = () => {
  return useQuery({
    queryKey: ['adminMenu'],
    queryFn: adminGetMenu,
  });
};

export const useAdminMenuDefaults = () => {
  return useQuery({
    queryKey: ['adminMenuDefaults'],
    queryFn: adminGetMenuDefaults,
  });
};

export const useAdminBillSummary = (month) => {
  return useQuery({
    queryKey: ['adminBillSummary', month],
    queryFn: () => adminGetBillSummary(month),
    enabled: !!month,
  });
};

export const useMealViolations = (month) => {
  return useQuery({
    queryKey: ['mealViolations', month],
    queryFn: () => adminGetMealViolations(month),
    enabled: !!month,
  });
};

export const usePendingBills = (rollNumber) => {
  return useQuery({
    queryKey: ['pendingBills', rollNumber],
    queryFn: () => adminGetPendingBills(rollNumber),
    enabled: !!rollNumber,
  });
};
