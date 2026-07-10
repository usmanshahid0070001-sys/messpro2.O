export const getDashboardPath = (role) => {
  const normalizedRole = role?.toLowerCase();

  switch (normalizedRole) {
    case 'admin':
      return '/admin-dashboard';
    case 'manager':
      return '/manager-dashboard';
    case 'student':
      return '/student-dashboard';
    case 'superadmin':
      return '/super-admin';
    default:
      return '/';
  }
};
