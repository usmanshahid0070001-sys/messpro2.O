import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import type { User } from '../../store/slices/AuthSlice';

interface VerifyResponse {
  user: User;
  token: string;
  message?: string;
  success: boolean;
}

export const useVerifySession = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: async () => {
      const { data } = await apiClient.get<VerifyResponse>('/auth/verify');
      return data;
    },
    // Only run when enabled (default: true). AuthSync passes enabled:false after login
    // to avoid the stale pre-login error being misread as a session expiry.
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
    retry: false,         // Don't retry if the user is unauthenticated
    refetchOnWindowFocus: false, // Prevent refetching on tab switch
    // A 401 here on cold-start is expected (no session yet).
    // Suppress it from the browser console — AuthSync handles the error state directly.
    throwOnError: false,
  });
};
