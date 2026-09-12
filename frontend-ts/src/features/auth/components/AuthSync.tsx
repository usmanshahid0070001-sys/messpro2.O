import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout } from '../../../store/slices/AuthSlice';
import { clearHostel } from '../../../store/slices/HostelSlice';
import { useVerifySession } from '../../../hooks/queries/useAuthQueries';
import type { RootState } from '../../../store';
import { toast } from 'sonner';

export function AuthSync({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  const isOAuthCallback =
    typeof window !== 'undefined' && window.location.search.includes('auth=');
  const hasStoredToken =
    typeof window !== 'undefined' && Boolean(localStorage.getItem('token'));

  // Enable verify session if authenticated or when returning with an OAuth callback/stored token
  const { data, error, isSuccess } = useVerifySession({
    enabled: isAuthenticated || isOAuthCallback || hasStoredToken,
  });

  useEffect(() => {
    // When backend verifies the session (e.g. from HttpOnly cookie), populate Redux credentials
    if (isSuccess && data?.user) {
      dispatch(setCredentials({ user: data.user, token: data.token || token || '' }));
    }
  }, [isSuccess, data, dispatch, token]);

  useEffect(() => {
    // If the token is invalid or expired on backend, log the user out cleanly
    if (error && isAuthenticated) {
      dispatch(logout());
      dispatch(clearHostel());
      toast.info('Session expired. Please log in again.');
    }
  }, [error, isAuthenticated, dispatch]);

  return <>{children}</>;
}
