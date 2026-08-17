import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { toast } from 'sonner';

export interface CreateRoomPayload {
  roomName: string;
  capacity: number;
}

export interface AlloteRoomPayload {
  studentId: string;
  roomId: string;
}

export interface DisalloteRoomPayload {
  studentId: string;
}

export interface ChangeRoomPayload {
  studentId: string;
  newRoomId: string;
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRoomPayload) => {
      const response = await apiClient.post('/residence', payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['residence'] });
      toast.success('Room created successfully', {
        description: `Room "${data.data?.roomName}" is now available for allocation.`,
      });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to create room';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const response = await apiClient.delete(`/residence/${roomId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residence'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Room removed successfully', {
        description: 'The room and any residents were disalloted.',
      });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to delete room';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useAlloteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AlloteRoomPayload) => {
      const response = await apiClient.post('/residence/allote', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residence'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Resident allotted to room successfully');
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to allot room';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useDisalloteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DisalloteRoomPayload) => {
      const response = await apiClient.post('/residence/disallote', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residence'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Resident deallocated from room');
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to deallocate resident';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useChangeRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ChangeRoomPayload) => {
      const response = await apiClient.post('/residence/change', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residence'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Resident room changed successfully');
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to swap room';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};

export const useMarkRoomCleaning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/residence/my-room/cleaning');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residence'] });
      toast.success('Cleaning attendance logged successfully', {
        description: "Your room's cleaning date has been updated.",
      });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to log cleaning attendance';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
};
