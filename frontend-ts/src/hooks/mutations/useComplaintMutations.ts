import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import type { ComplaintIntensity, ComplaintStatus } from '../queries/useComplaintQueries';

export interface CreateComplaintPayload {
  category: string;
  intensity: ComplaintIntensity;
  description: string;
}

export interface UpdateComplaintStatusPayload {
  id: string;
  status: ComplaintStatus;
}

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateComplaintPayload) => {
      const response = await apiClient.post('/complaints', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint submitted successfully', {
        description: 'Hostel administration has been notified.',
      });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to submit complaint';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complaintId: string) => {
      await apiClient.delete(`/complaints/${complaintId}`);
      return complaintId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint withdrawn', {
        description: 'Your open complaint has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to delete complaint';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateComplaintStatusPayload) => {
      const response = await apiClient.patch(`/complaints/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success(`Complaint status changed to ${variables.status}`);
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to update complaint status';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};
