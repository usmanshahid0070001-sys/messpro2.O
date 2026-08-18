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

  // Check if we have an active session or an OAuth callback query param
  const hasTokenOrOAuth = Boolean(
    token || (typeof window !== 'undefined' && (localStorage.getItem('token') || window.location.search.includes('auth=')))
  );

  // Verify session with the backend whenever an authenticated session is active or OAuth returned
  const { data, error, isSuccess } = useVerifySession({
    enabled: hasTokenOrOAuth && isAuthenticated,
  });

  useEffect(() => {
    // Only sync if user is currently authenticated and verified data was returned
    if (isSuccess && data && isAuthenticated) {
      dispatch(setCredentials({ user: data.user, token: data.token || token || '' }));
    }
  }, [isSuccess, data, dispatch, isAuthenticated]);

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


