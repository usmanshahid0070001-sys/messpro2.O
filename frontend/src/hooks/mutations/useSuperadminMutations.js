import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hostelApi } from '../../api/endpoints/hostel.api';

export const useCreateHostel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hostelApi.createHostel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
    }
  });
};

export const useUpdateHostelSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, settingsData }) => hostelApi.updateHostelSettings(id, settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
    }
  });
};

export const useAddHostelUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }) => hostelApi.addHostelUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
    }
  });
};
