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

export const useSendEmailOtpMutation = () => {
  return useMutation({
    mutationFn: async (newEmail: string) => {
      const { data } = await apiClient.post('/auth/onboarding/send-email-otp', { newEmail });
      return data;
    },
  });
};

export const useVerifyEmailOtpMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ newEmail, otp }: { newEmail: string; otp: string }) => {
      const { data } = await apiClient.post('/auth/onboarding/verify-email-otp', { newEmail, otp });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'verify'] });
    },
  });
};

export const useUpdateOnboardingPasswordMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { data } = await apiClient.post('/auth/onboarding/update-password', { newPassword });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'verify'] });
    },
  });
};

export const useSignAgreementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/users/sign-agreement');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'verify'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
