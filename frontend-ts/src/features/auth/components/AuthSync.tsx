import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout } from '../../../store/slices/AuthSlice';
import { useVerifySession } from '../../../hooks/queries/useAuthQueries';
import type { RootState } from '../../../store';
import { toast } from 'sonner';

export function AuthSync({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // The verify query will run on mount if the user is not authenticated in Redux
  // (e.g. they just refreshed the page, or are returning from Google OAuth)
  const { data, error, isLoading, isSuccess } = useVerifySession();

  useEffect(() => {
    // If the verify endpoint returned valid user data and a token, save it to Redux
    if (isSuccess && data) {
      dispatch(setCredentials({ user: data.user, token: data.token }));
    }
  }, [isSuccess, data, dispatch]);

  useEffect(() => {
    // If the verify endpoint specifically failed (e.g. token expired, no cookie), 
    // and we thought we were authenticated, we should probably clear the Redux state.
    if (error && isAuthenticated) {
      dispatch(logout());
      toast.info("Session expired. Please log in again.");
    }
  }, [error, isAuthenticated, dispatch]);

  // While we are checking the session on initial load, we might want to show a loading state
  // or just render the children. Rendering children is fine if the routes are protected,
  // because the protected routes will wait for isAuthenticated to be true anyway.
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
