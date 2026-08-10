import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complaintData) => {
      const response = await api.post('/api/complaints', complaintData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Complaint submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['student-complaints'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    },
  });
};

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/complaints/${id}`);
    },
    onSuccess: () => {
      toast.success('Complaint deleted');
      queryClient.invalidateQueries({ queryKey: ['student-complaints'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete complaint');
    },
  });
};

export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.patch(`/api/complaints/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};
