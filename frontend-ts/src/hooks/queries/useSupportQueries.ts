import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface ContactChannel {
  label: string;
  value: string;
}

export interface SupportContact {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappNumbers?: ContactChannel[];
  phoneNumbers?: ContactChannel[];
  emailAddresses?: ContactChannel[];
  additionalInfo: Array<{ key: string; value: string }>;
}

const fetchSupportContact = async (): Promise<SupportContact> => {
  const response = await apiClient.get('/users/support-contact');
  return response.data.data;
};

export const useGetSupportContact = () => {
  return useQuery({
    queryKey: ['supportContact'],
    queryFn: fetchSupportContact,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};
