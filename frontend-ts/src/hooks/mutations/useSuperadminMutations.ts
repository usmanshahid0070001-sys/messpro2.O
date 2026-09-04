import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import { extractApiErrorMessage } from './useHostelMutations';

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
      const msg = extractApiErrorMessage(error, 'Failed to create hostel');
      toast.error(msg);
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
      const msg = extractApiErrorMessage(error, 'Failed to update settings');
      toast.error(msg);
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
      const msg = extractApiErrorMessage(error, 'Failed to add hostel user');
      toast.error(msg);
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

export interface SubmitHostelRequestPayload {
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
    planType: '10_day_trial' | 'standard' | 'custom';
    planId?: string;
    estimatedStudents?: number;
    estimatedManagers?: number;
    desiredFeatures?: string[];
    notes?: string;
  };
}

export const useSubmitHostelRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitHostelRequestPayload) => {
      const response = await apiClient.post('/hostels/requests', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostel-requests'] });
      toast.success('Hostel setup request submitted successfully! Check your email for confirmation.');
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to submit hostel setup request');
      toast.error(msg);
    },
  });
};

export interface ApproveHostelRequestPayload {
  id: string;
  planId: string;
  temporaryPassword?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export const useApproveHostelRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: ApproveHostelRequestPayload) => {
      const response = await apiClient.post(`/hostels/requests/${id}/approve`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostel-requests'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
      toast.success('Hostel approved and onboarded! Login credentials & welcome details emailed to client.');
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to approve hostel request');
      toast.error(msg);
    },
  });
};

export interface RejectHostelRequestPayload {
  id: string;
  reason: string;
}

export const useRejectHostelRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: RejectHostelRequestPayload) => {
      const response = await apiClient.post(`/hostels/requests/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostel-requests'] });
      toast.success('Hostel request marked as rejected');
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to reject hostel request');
      toast.error(msg);
    },
  });
};

export const useDeleteHostel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/hostels/${id}`);
      return response.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'hostels'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(data?.message || 'Hostel and associated users deleted successfully');
    },
    onError: (error: any) => {
      const msg = extractApiErrorMessage(error, 'Failed to delete hostel');
      toast.error(msg);
    },
  });
};


