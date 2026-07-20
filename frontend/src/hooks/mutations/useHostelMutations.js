import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hostelApi } from '../../api/endpoints/hostel.api';
import toast from 'react-hot-toast';

export const useUpdateMyHostelSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settingsData) => hostelApi.updateMyHostelSettings(settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHostel'] });
      toast.success('Hostel settings updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update hostel settings');
    }
  });
};
