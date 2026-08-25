import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface PlanLimits {
  maxStudents: number;
  maxManagers: number;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  billingCycle?: 'monthly' | 'yearly';
  description?: string;
  isActive: boolean;
  limits: PlanLimits;
  features: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HostelSettings {
  autoVerification?: boolean;
  gracePeriodMinutes?: number;
  allowGuestScans?: boolean;
  allowAdvanceMealSelection?: boolean;
  dailyMealLimit?: number;
}

export interface HostelTenant {
  _id: string;
  name: string;
  subdomain?: string;
  location: string;
  status: 'Active' | 'Trial' | 'Suspended' | 'Expired';
  plan?: SubscriptionPlan | string;
  settings?: HostelSettings;
  locationCoords?: {
    lat: number;
    lng: number;
  };
  maxMealSelection?: number;
  qrSecret?: string;
  subscriptionExpiresAt?: string;
  trialExpiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  studentsCount?: number;
  adminsCount?: number;
}

export const useGetHostels = (enabled = true) => {
  return useQuery<HostelTenant[]>({
    queryKey: ['superadmin', 'hostels'],
    queryFn: async () => {
      const response = await apiClient.get('/hostels');
      return response.data?.data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useGetPlans = (enabled = true) => {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ['superadmin', 'plans'],
    queryFn: async () => {
      const response = await apiClient.get('/plans');
      return response.data?.data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
