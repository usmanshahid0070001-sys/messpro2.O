import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      // Differentiate endpoints based on role being created
      if (userData.role === 'admin' || userData.role === 'manager') {
        // Superadmin/Admin creating Manager/Admin
        const { hostelId, ...rest } = userData;
        const response = await api.post(`/api/hostels/${hostelId}/users`, rest);
        return response.data.data;
      } else {
        // Creating Student
        const response = await api.post('/api/auth/register', userData);
        return response.data.data;
      }
    },
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['targettedUsers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/api/users/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['targettedUsers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });
};
