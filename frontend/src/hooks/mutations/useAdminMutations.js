import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  adminAddStudent,
  adminBulkUploadStudents,
  adminDeleteStudent,
  adminChangeStudentPassword,
  adminChangeAccommodation,
  adminUploadAttendance,
  adminUploadAttendanceChunk,
  adminSaveMealPrices,
  adminUpdateMealSettings,
  adminUpdateMenu,
  adminGenerateBills,
  adminUpdateSurcharges,
  adminAdjustBill,
  adminApplyViolationFines,
} from '../../api/endpoints/admin.api';

// ─── ADMIN MUTATION HOOKS ───────────────────────────────────────────────────

// --- Student Management ---
export const useAddStudent = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminAddStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      toast.success('Student added successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add student');
    },
    ...options,
  });
};

export const useBulkUploadStudents = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminBulkUploadStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      toast.success('Students uploaded successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload students');
    },
    ...options,
  });
};

export const useDeleteStudent = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      toast.success('Student deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    },
    ...options,
  });
};

export const useChangeStudentPassword = (options = {}) => {
  return useMutation({
    mutationFn: adminChangeStudentPassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
    ...options,
  });
};

export const useChangeAccommodation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminChangeAccommodation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      toast.success('Accommodation updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update accommodation');
    },
    ...options,
  });
};

// --- Attendance ---
export const useUploadAttendance = (options = {}) => {
  return useMutation({
    mutationFn: adminUploadAttendance,
    onSuccess: () => {
      toast.success('Attendance uploaded successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload attendance');
    },
    ...options,
  });
};

export const useUploadAttendanceChunk = (options = {}) => {
  return useMutation({
    mutationFn: adminUploadAttendanceChunk,
    ...options,
  });
};

// --- Meal Prices ---
export const useSaveMealPrices = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminSaveMealPrices,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mealPrices'] });
      toast.success('Meal prices saved!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save prices');
    },
    ...options,
  });
};

// --- Meal Settings ---
export const useUpdateMealSettings = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUpdateMealSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealSettings'] });
      toast.success('Meal settings updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
    ...options,
  });
};

// --- Menu ---
export const useUpdateAdminMenu = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUpdateMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
      toast.success('Menu updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update menu');
    },
    ...options,
  });
};

// --- Bills ---
export const useGenerateBills = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminGenerateBills,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Bills generated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate bills');
    },
    ...options,
  });
};

export const useUpdateSurcharges = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUpdateSurcharges,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Surcharges updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update surcharges');
    },
    ...options,
  });
};

export const useAdjustBill = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminAdjustBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Bill adjusted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to adjust bill');
    },
    ...options,
  });
};

// --- Violations ---
export const useApplyViolationFines = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApplyViolationFines,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealViolations'] });
      toast.success('Violation fines applied!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to apply fines');
    },
    ...options,
  });
};
