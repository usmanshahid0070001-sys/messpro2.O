import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mealApi } from '../../api/endpoints/meal.api';
import toast from 'react-hot-toast';

// ─── MEAL MUTATION HOOKS ───────────────────────────────────────────────────────

export const useUpdateMealSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mealApi.updateMealSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealSchedule'] });
      toast.success('Meal schedule updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update meal schedule');
    }
  });
};
