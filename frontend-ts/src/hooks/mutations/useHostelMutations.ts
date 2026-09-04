import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import apiClient from '@/api/client';
import { setHostel } from '@/store/slices/HostelSlice';
import { toast } from 'sonner';

export interface CustomRegistrationField {
  name: string;
  isRequired: boolean;
}

export interface PlanFeatureConfig {
  name: string;
  isEnabled: boolean;
}

export interface UpdateHostelSettingsPayload {
  subdomain?: string;
  location?: string;
  customRegistrationFields?: CustomRegistrationField[];
  'plan.features'?: PlanFeatureConfig[];
  planFeatures?: PlanFeatureConfig[];
  locationCoords?: {
    lat: number;
    lng: number;
  };
  qrSecret?: string;
  settings?: {
    autoMealVerification?: boolean;
    authMethod?: 'Email' | 'RollNumber';
    attendanceMethod?: 'Manual' | 'QR' | 'Biometric';
    billingModel?: 'Prepaid' | 'Postpaid' | 'FlatRate';
    maxMealSelection?: number;
  };
}

export const extractApiErrorMessage = (error: any, fallback = 'An unexpected error occurred'): string => {
  if (!error) return fallback;
  const data = error.response?.data;
  if (!data) return error.message || fallback;

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(', ');
  }
  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }
  return fallback;
};

export const useUpdateMyHostelSettings = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (payload: UpdateHostelSettingsPayload) => {
      const response = await apiClient.patch('/hostels/my-hostel/settings', payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myHostel'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'verify'] });

      // Synchronize Redux hostel state immediately
      if (data?.data) {
        dispatch(setHostel(data.data));
      }

      toast.success(data?.message || 'Hostel settings updated successfully');
    },
    onError: (error: any) => {
      const errorMsg = extractApiErrorMessage(error, 'Failed to update hostel settings');
      toast.error(errorMsg);
    },
  });
};
