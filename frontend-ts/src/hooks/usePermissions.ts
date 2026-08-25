import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function usePermissions() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { currentHostel } = useSelector((state: RootState) => state.hostel);

  const role = user?.role;
  const permissions = user?.permissions || [];
  const features = currentHostel?.plan?.features || [];

  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isStudent = role === 'student';

  /**
   * Check if user has permission.
   * Superadmin and Admin implicitly have all tenant-level permissions.
   * Managers must explicitly have the permission string in `user.permissions`.
   */
  const hasPermission = (permissionKey: string): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin || isAdmin) return true;
    return permissions.includes(permissionKey);
  };

  /**
   * Check if current hostel subscription plan enables a feature module.
   * Superadmin bypasses plan limits.
   */
  const hasFeature = (featureName: string): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    const normalizedTarget = featureName.toLowerCase().replace(/[\s-]+/g, '_');
    const feature = features.find(
      (f) => f.name.toLowerCase().replace(/[\s-]+/g, '_') === normalizedTarget
    );
    return feature?.isEnabled === true;
  };

  return {
    user,
    role,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isManager,
    isStudent,
    permissions,
    hasPermission,
    hasFeature,
  };
}
