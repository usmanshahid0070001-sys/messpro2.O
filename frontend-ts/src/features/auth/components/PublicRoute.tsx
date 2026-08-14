import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

export const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    // If user is already authenticated, redirect them away from public pages (like login)
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};
