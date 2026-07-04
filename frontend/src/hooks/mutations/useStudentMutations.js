import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studentUpdateSelections } from '../../api/endpoints/student.api';

// ─── STUDENT MUTATION HOOKS ─────────────────────────────────────────────────

export const useUpdateMealSelections = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => studentUpdateSelections({ weeklyAttendance: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklySelections'] });
      toast.success('Meal selections saved!');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to save selections';
      toast.error(msg);
    },
    ...options,
  });
};
