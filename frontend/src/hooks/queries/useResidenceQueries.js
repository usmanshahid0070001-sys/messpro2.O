import { useQuery } from '@tanstack/react-query';
import { residenceApi } from '../../api/endpoints/residence.api';

// ─── RESIDENCE QUERY HOOKS ──────────────────────────────────────────────────────

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: residenceApi.getRooms,
  });
};
