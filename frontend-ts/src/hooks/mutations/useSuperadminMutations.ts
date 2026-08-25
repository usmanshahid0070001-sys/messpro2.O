import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import type { HostelSettings, SubscriptionPlan } from '../queries/useSuperadminQueries';

export interface CreateHostelPayload {
  name: string;
  subdomain?: string;
  location: string;
  plan: string;
  maxMealSelection?: number;
  adminName?: string;
  adminEmail?: string;
  managerName?: string;
  managerEmail?: string;
}

export interface UpdateHostelSettingsPayload {
  id: string;
  settingsData: {
    plan?: string;
    additionalDays?: number;
    subdomain?: string;
    location?: string;
    status?: 'Active' | 'Trial' | 'Suspended' | 'Expired';
    settings?: {
      authMethod?: 'Email' | 'RollNumber';
      attendanceMethod?: 'Manual' | 'QR' | 'Biometric';
      billingModel?: 'Prepaid' | 'Postpaid' | 'FlatRate';
      autoMealVerification?: boolean;
      maxMealSelection?: number;
    };
    locationCoords?: {
      lat: number;
      lng: number;
    };
    qrSecret?: string;
  };
}

export interface AddHostelUserPayload {
  id: string; // Hostel ID
  userData: {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'student';
    permissions?: string[];
  };
}

export interface CreatePlanPayload {
  name: string;
  price: number;
  billingCycle?: 'monthly' | 'yearly';
  description?: string;
  isActive?: boolean;
  limits: {
    maxStudents: number;
    maxManagers: number;
  };
  features: string[];
}

export interface UpdatePlanPayload {
  id: string;
  payload: Partial<CreatePlanPayload>;
}

export const useCreateHostel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateHostelPayload) => {
      const response = await apiClient.post('/hostels', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
      toast.success('Hostel created successfully and welcome credentials dispatched');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to create hostel';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useUpdateHostelSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, settingsData }: UpdateHostelSettingsPayload) => {
      const response = await apiClient.patch(`/hostels/${id}/settings`, settingsData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
      toast.success('Hostel settings updated successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update settings';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useAddHostelUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }: AddHostelUserPayload) => {
      const response = await apiClient.post(`/hostels/${id}/users`, userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Staff user created and added to hostel successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to add hostel user';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePlanPayload) => {
      const response = await apiClient.post('/plans', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'plans'] });
      toast.success('Subscription plan tier created successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to create plan';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdatePlanPayload) => {
      const response = await apiClient.patch(`/plans/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'plans'] });
      toast.success('Plan tier updated successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update plan';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};
