import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import type { User } from '../../store/slices/AuthSlice';

interface LoginCredentials {
  email: string;
  password?: string;
  // you might need pin/other fields later
}

interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: () => {
      // Clear the verify query so any past errors don't linger
      queryClient.resetQueries({ queryKey: ['auth', 'verify'] });
    }
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/auth/logout');
      return data;
    },
    onSuccess: () => {
      // Clear the entire React Query cache on logout so no stale queries or verify data remain
      queryClient.clear();
    }
  });
};
