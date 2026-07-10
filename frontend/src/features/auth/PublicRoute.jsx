import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { getDashboardPath } from "../../utils/authRoutes";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait for the auth verification to finish before deciding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#060812]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (user && user.role) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // If NO user, show the landing/login page
  return children;
}
