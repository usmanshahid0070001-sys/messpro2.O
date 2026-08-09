import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useAdminBillSummary = (month, status) => {
  return useQuery({
    queryKey: ['adminBillSummary', month, status],
    queryFn: () => month ? billingApi.getMonthlyBill(month, status) : billingApi.getAllBills(status),
  });
};

export const usePayBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ billId, amount }) => billingApi.partialPayBill(billId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBillSummary'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to record payment');
    }
  });
};

export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ billId, customCharges }) => billingApi.updateBill(billId, customCharges),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBillSummary'] });
      toast.success('Bill updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update bill');
    }
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

export const useGetMealPricesForBilling = (startDate, endDate) => {
  return useQuery({
    queryKey: ['mealPricesForBilling', startDate, endDate],
    queryFn: () => billingApi.getMealPricesForBilling(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useUpdateMealPrices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates) => billingApi.updateMealPrices(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPricesForBilling'] });
    },
  });
};

export const useGetBillingSettings = () => {
  return useQuery({
    queryKey: ['billingSettings'],
    queryFn: () => billingApi.getBillingSettings(),
  });
};

export const useUpdateBillingSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customCharges, isDynamicBillingEnabled }) => billingApi.updateBillingSettings(customCharges, isDynamicBillingEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingSettings'] });
    },
  });
};

export const useGenerateBills = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => billingApi.generateBills(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBillSummary'] });
    },
  });
};
