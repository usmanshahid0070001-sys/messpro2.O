import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/endpoints/auth.api';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => authApi.logout(),
  });
};
