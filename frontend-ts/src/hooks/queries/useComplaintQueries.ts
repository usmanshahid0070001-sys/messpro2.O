import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export type ComplaintIntensity = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ComplaintStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved';

export interface Complaint {
  _id: string;
  hostelid: string | { _id: string; name: string };
  studentId?: { _id: string; name: string; id: string; email: string } | string | null;
  roomid?: { _id: string; roomNumber: string; block?: string; floor?: number } | string | null;
  roll_number: string;
  category: string;
  intensity: ComplaintIntensity;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  urgent: number;
  high: number;
  active: number;
}

export interface ComplaintFilterParams {
  status?: string;
  intensity?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
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

// Admin/Manager fetch hostel complaints with status or filter params
const fetchAdminComplaints = async (
  filter: string | ComplaintFilterParams = 'all'
): Promise<Complaint[]> => {
  const params = typeof filter === 'string' ? { status: filter } : filter;
  const response = await apiClient.get('/complaints', { params });
  return response.data;
};

export const useGetAdminComplaints = (
  filter: string | ComplaintFilterParams = 'all',
  enabled = true
) => {
  return useQuery({
    queryKey: ['complaints', 'admin', filter],
    queryFn: () => fetchAdminComplaints(filter),
    enabled,
    staleTime: 1000 * 20, // 20 seconds
  });
};

// Admin/Manager fetch real aggregate complaint statistics
const fetchComplaintStats = async (): Promise<ComplaintStats> => {
  const response = await apiClient.get('/complaints/stats');
  return response.data.data;
};

export const useGetComplaintStats = (enabled = true) => {
  return useQuery({
    queryKey: ['complaints', 'stats'],
    queryFn: fetchComplaintStats,
    enabled,
    staleTime: 1000 * 30, // 30 seconds
  });
};

