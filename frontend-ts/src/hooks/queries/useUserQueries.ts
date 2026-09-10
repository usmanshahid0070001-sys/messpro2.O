import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface ManageableUser {
  _id: string;
  id?: string; // Roll number for students
  rollNumber?: string;
  name: string;
  email: string;
  role: 'student' | 'manager' | 'admin' | 'superadmin';
  status?: 'Active' | 'Suspended';
  hostelId: string;
  hostelName?: string;
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

export const fetchUserPassword = async (userId: string) => {
  const response = await apiClient.get(`/users/${userId}/password`);
  return response.data.data as {
    userId: string;
    email: string;
    name: string;
    role: string;
    password: string | null;
  };
};

export const useGetUserPassword = (userId: string | null, enabled = false) => {
  return useQuery({
    queryKey: ['userPassword', userId],
    queryFn: () => fetchUserPassword(userId!),
    enabled: Boolean(userId) && enabled,
    staleTime: 0,
  });
};
