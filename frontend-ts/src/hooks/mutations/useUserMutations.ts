import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { toast } from 'sonner';

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
      toast.success('User created successfully and email notification sent');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to create user';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
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
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update user';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};
