import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../../api/endpoints/student.api';
import toast from 'react-hot-toast';

export const useUpdateMealSelections = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (selections) => studentApi.updateMealSelections(selections),
    onSuccess: () => {
      // Invalidate all weekly selections to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['weeklySelections'] });
      toast.success('Meal selections updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update meal selections');
    }
  });
};
