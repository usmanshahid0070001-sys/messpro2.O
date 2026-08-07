export const FEATURE_MAP: Record<string, string[]> = {
  service_management: ['Service Management', 'Room Service'],
  complaint_management: ['Complaint Management'],
  user_management: ['User Management'],
  residence_management: ['Residence Management'],
  manual_attendance: ['Manual Attendance'],
  qr_attendance: ['QR Attendance'],
  biometric_attendance: ['Biometric Attendance'],
  bill_generation: ['Bill Generation'],
  bill_management: ['Bill Management', 'Bills Management'],
  meal_settings: ['Meal settings'],
  meal_control: ['Meal control'],
};

export function hasPermission(permName: string, user: any, enabledFeatures: any[]): boolean {
  if (!enabledFeatures) return false;
  
  const matchingFeatures = FEATURE_MAP[permName] || [];
  const isFeatureEnabled = enabledFeatures.some((f: any) =>
    matchingFeatures.includes(f.name) && f.isEnabled
  );
  
  if (!isFeatureEnabled) return false;
  
  if (user?.role === 'manager' && (!user.permissions || user.permissions.length === 0)) {
    return ['bill_management', 'meal_settings', 'meal_control'].includes(permName);
  }
  
  return user?.permissions?.includes(permName);
}
