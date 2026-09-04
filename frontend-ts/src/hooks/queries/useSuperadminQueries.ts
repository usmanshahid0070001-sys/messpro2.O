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

export interface HostelSetupRequest {
  _id: string;
  hostelName: string;
  subdomain: string;
  location: string;
  address?: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  managerName?: string;
  managerEmail?: string;
  requestedPlan: {
    planType: '10_day_trial' | 'trial' | 'standard' | 'enterprise' | 'custom' | string;
    planId?: { _id: string; name: string; price?: number; limits?: any } | string;
    estimatedStudents?: number;
    estimatedManagers?: number;
    desiredFeatures?: string[];
    customFeatures?: string[];
    notes?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  approvedHostelId?: {
    _id: string;
    name: string;
    subdomain: string;
  } | string;
  rejectionReason?: string;
  supportContact?: {
    email?: string;
    whatsappPhone?: string;
  };
  createdAt: string;
  updatedAt: string;
}


export const useGetHostelRequests = (params?: { status?: string; search?: string }, enabled = true) => {
  return useQuery<{ requests: HostelSetupRequest[]; total: number }>({
    queryKey: ['superadmin', 'hostel-requests', params],
    queryFn: async () => {
      const response = await apiClient.get('/hostels/requests', { params });
      const resData = response.data;
      if (Array.isArray(resData?.data)) {
        return {
          requests: resData.data,
          total: typeof resData.total === 'number' ? resData.total : resData.data.length,
        };
      }
      if (Array.isArray(resData?.requests)) {
        return {
          requests: resData.requests,
          total: typeof resData.total === 'number' ? resData.total : resData.requests.length,
        };
      }
      if (Array.isArray(resData)) {
        return {
          requests: resData,
          total: resData.length,
        };
      }
      return { requests: [], total: 0 };
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds
  });
};
