import { useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from '../../api/endpoints/superadmin.api';

export const useCreateHostel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: superadminApi.createHostel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
    }
  });
};

export const useUpdateHostelSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, settingsData }) => superadminApi.updateHostelSettings(id, settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
    }
  });
};
