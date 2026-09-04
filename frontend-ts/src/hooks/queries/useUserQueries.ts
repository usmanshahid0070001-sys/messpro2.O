import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface ManageableUser {
  _id: string;
  id?: string; // Roll number for students
  name: string;
  email: string;
  role: 'student' | 'manager' | 'admin' | 'superadmin';
  status?: 'Active' | 'Suspended';
  hostelId: string;
  permissions: string[];
  additionalInfo?: Array<{ key: string; value: any }>;
  room?: {
    _id: string;
    roomName: string;
    capacity: number;
    status: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

const fetchUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data.data as ManageableUser[];
};

export const useGetUsers = (enabled = true) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled,
  });
};
