import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import type { User } from '../../store/slices/AuthSlice';

interface VerifyResponse {
  user: User;
  token: string;
  message?: string;
  success: boolean;
}

export const useVerifySession = () => {
  return useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: async () => {
      const { data } = await apiClient.get<VerifyResponse>('/auth/verify');
      return data;
    },
    // We only want to run this once on mount, or when explicitly requested
    staleTime: Infinity,
    retry: false, // Don't retry if the user is unauthenticated
  });
};
