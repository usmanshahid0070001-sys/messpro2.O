import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';
import { Ionicons } from '@expo/vector-icons';

interface PermissionGateProps {
  permission: string;
  enabledFeatures: any[];
  children: React.ReactNode;
}

export default function PermissionGate({ permission, enabledFeatures, children }: PermissionGateProps) {
  const { user } = useAuth();
  
  if (hasPermission(permission, user, enabledFeatures)) {
    return <>{children}</>;
  }

  // The fallback for when they don't have permission is to just show nothing,
  // matching the web dashboard behavior where tabs are filtered out.
  return null;
}
