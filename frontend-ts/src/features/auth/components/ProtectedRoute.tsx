import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  allowedRoles?: ('superadmin' | 'admin' | 'manager' | 'student')[];
  requiredPermission?: string;
  requiredFeature?: string;
  fallbackPath?: string;
}

export const ProtectedRoute = ({
  allowedRoles,
  requiredPermission,
  requiredFeature,
  fallbackPath = '/app',
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, role, isSuperAdmin, hasPermission, hasFeature } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Check Role Authorization
  if (allowedRoles && role && !allowedRoles.includes(role as any)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // 2. Check Granular Permission Authorization (e.g. manager without user_management)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground">
            Your account does not possess the <code className="font-mono text-foreground font-semibold">{requiredPermission}</code> permission required to access this module.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // 3. Check Plan Feature Enablement (e.g. hostel plan disables biometric or residence)
  if (requiredFeature && !hasFeature(requiredFeature) && !isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Feature Inactive in Plan</h2>
          <p className="text-xs text-muted-foreground">
            This module is currently inactive in your hostel&apos;s subscription plan tier. Please contact your hostel administrator to upgrade.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return <Outlet />;
};
