import { useQuery } from '@tanstack/react-query';
import { mealApi } from '../../api/endpoints/meal.api';

// ─── MEAL QUERY HOOKS ──────────────────────────────────────────────────────────

export const useMealSchedule = () => {
  return useQuery({
    queryKey: ['mealSchedule'],
    queryFn: mealApi.getMealSchedule,
  });
};
