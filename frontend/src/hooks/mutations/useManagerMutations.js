import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  managerPayBill,
  managerPartiallyPayBill,
  managerUpdateMenu,
} from '../../api/endpoints/manager.api';

// ─── MANAGER MUTATION HOOKS ─────────────────────────────────────────────────

export const usePayBill = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: managerPayBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerAllBills'] });
      toast.success('Bill paid successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Payment failed');
    },
    ...options,
  });
};

export const usePartialPayBill = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: managerPartiallyPayBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerAllBills'] });
      toast.success('Partial payment recorded!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Partial payment failed');
    },
    ...options,
  });
};

export const useUpdateManagerMenu = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: managerUpdateMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerMenu'] });
      toast.success('Menu updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update menu');
    },
    ...options,
  });
};
