import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import { extractApiErrorMessage } from './useHostelMutations';

export interface CreateUserPayload {
  name: string;
  email: string;
  role: 'student' | 'manager' | 'admin' | 'superadmin';
  id?: string; // Roll number for students
  permissions?: string[];
  additionalInfo?: Array<{ key: string; value: any }>;
}

export interface UpdateUserPayload {
  name?: string;
  status?: 'Active' | 'Suspended';
  permissions?: string[];
  additionalInfo?: Array<{ key: string; value: any }>;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const response = await apiClient.post('/users/add', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['myHostel'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
      toast.success('User created successfully and email notification sent');
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to create user');
      toast.error(msg);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserPayload }) => {
      const response = await apiClient.patch(`/users/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['myHostel'] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to update user');
      toast.error(msg);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['myHostel'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['residence'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
      toast.success(data?.message || 'User deleted successfully');
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to delete user');
      toast.error(msg);
    },
  });
};
