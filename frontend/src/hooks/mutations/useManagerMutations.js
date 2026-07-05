import { useMutation, useQueryClient } from '@tanstack/react-query';
import { managerApi } from '../../api/endpoints/manager.api';

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (menuData) => managerApi.updateMenu(menuData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSchedule'] });
    },
  });
};

export const usePayBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (billId) => managerApi.payBill(billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBills'] });
    },
  });
};

export const usePartialPayBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ billId, amount }) => managerApi.partialPayBill(billId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBills'] });
    },
  });
};
