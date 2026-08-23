import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export type RoomStatus = 'Available' | 'Full' | 'Maintenance';

export interface Room {
  _id: string;
  hostelId: string;
  roomName: string;
  capacity: number;
  occupants: number;
  status: RoomStatus;
  cleaningDates: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Roommate {
  _id: string;
  id?: string; // Roll number
  name: string;
  email?: string;
  role: string;
}

export interface MyRoomDetails extends Room {
  roommates: Roommate[];
}

// Fetch all rooms for hostel (Admin / Manager)
const fetchRooms = async (): Promise<Room[]> => {
  const response = await apiClient.get('/residence');
  return response.data.data;
};

export const useGetRooms = (enabled = true) => {
  return useQuery({
    queryKey: ['residence', 'rooms'],
    queryFn: fetchRooms,
    enabled,
    staleTime: 1000 * 20, // 20 seconds
  });
};

// Fetch current user's room details (Student / Manager)
const fetchMyRoom = async (): Promise<MyRoomDetails> => {
  const response = await apiClient.get('/residence/my-room');
  return response.data.data;
};

export const useGetMyRoom = (enabled = true) => {
  return useQuery({
    queryKey: ['residence', 'my-room'],
    queryFn: fetchMyRoom,
    enabled,
    retry: (failureCount, error: any) => {
      // Don't retry if student simply doesn't have a room allotted yet (404)
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 30,
  });
};
