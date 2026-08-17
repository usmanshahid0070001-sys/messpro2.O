import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
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
  settings?: {
    autoMealVerification?: boolean;
    authMethod?: 'Email' | 'RollNumber';
    attendanceMethod?: 'Manual' | 'QR' | 'Biometric';
    billingModel?: 'Prepaid' | 'Postpaid' | 'FlatRate';
    maxMealSelection?: number;
  };
}

export const useUpdateMyHostelSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateHostelSettingsPayload) => {
      const response = await apiClient.patch('/hostels/my-hostel/settings', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHostel'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'verify'] });
      toast.success('Hostel settings updated successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update hostel settings';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};
