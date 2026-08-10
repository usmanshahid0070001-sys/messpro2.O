import { useQuery } from '@tanstack/react-query';
import { residenceApi } from '../../api/endpoints/residence.api';

// ─── RESIDENCE QUERY HOOKS ──────────────────────────────────────────────────────

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: residenceApi.getRooms,
  });
};

export const useMyRoom = () => {
  return useQuery({
    queryKey: ['my-room'],
    queryFn: residenceApi.getMyRoom,
    retry: false, // Don't retry on 404
  });
};
