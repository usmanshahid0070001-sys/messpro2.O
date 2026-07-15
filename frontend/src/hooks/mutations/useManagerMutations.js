import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mealApi } from '../../api/endpoints/meal.api';
import { billingApi } from '../../api/endpoints/billing.api';

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (menuData) => mealApi.updateMenu(menuData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSchedule'] });
    },
  });
};

export const usePayBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (billId) => billingApi.payBill(billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBills'] });
    },
  });
};

export const usePartialPayBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ billId, amount }) => billingApi.partialPayBill(billId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBills'] });
    },
  });
};
