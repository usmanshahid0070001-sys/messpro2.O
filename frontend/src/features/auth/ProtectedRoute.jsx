import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../utils/authRoutes";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Wait for AuthProvider to finish checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#060812]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-5 h-5 rounded-full border-[3px] border-indigo-500/20 border-t-blue-500 animate-spin"
            style={{ animationTimingFunction: 'linear' }}
          />
          <span className="font-display font-black tracking-tight text-[#111111] dark:text-white text-base animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            Verifying Session<span className="text-blue-500">.</span>
          </span>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated) {
    localStorage.clear();
    sessionStorage.clear();
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role access
  if (role && allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
}
