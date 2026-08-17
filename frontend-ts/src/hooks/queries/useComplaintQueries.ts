import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export type ComplaintIntensity = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ComplaintStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved';

export interface Complaint {
  _id: string;
  hostelid: string | { _id: string; name: string };
  roomid?: { _id: string; roomNumber: string; block?: string } | string | null;
  roll_number: string;
  category: string;
  intensity: ComplaintIntensity;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

// Student fetch their own complaints
const fetchStudentComplaints = async (): Promise<Complaint[]> => {
  const response = await apiClient.get('/complaints/student');
  return response.data;
};

export const useGetStudentComplaints = (enabled = true) => {
  return useQuery({
    queryKey: ['complaints', 'student'],
    queryFn: fetchStudentComplaints,
    enabled,
    staleTime: 1000 * 30, // 30 seconds
  });
};

// Admin/Manager fetch hostel complaints with status filter
const fetchAdminComplaints = async (statusFilter = 'all'): Promise<Complaint[]> => {
  const response = await apiClient.get('/complaints', {
    params: { status: statusFilter },
  });
  return response.data;
};

export const useGetAdminComplaints = (statusFilter = 'all', enabled = true) => {
  return useQuery({
    queryKey: ['complaints', 'admin', statusFilter],
    queryFn: () => fetchAdminComplaints(statusFilter),
    enabled,
    staleTime: 1000 * 20, // 20 seconds
  });
};
