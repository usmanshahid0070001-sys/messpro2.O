import { useQuery } from '@tanstack/react-query';
import { planApi } from '../../api/endpoints/plan.api';

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: planApi.getPlans
  });
};
