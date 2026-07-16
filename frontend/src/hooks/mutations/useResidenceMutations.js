import { useMutation, useQueryClient } from '@tanstack/react-query';
import { residenceApi } from '../../api/endpoints/residence.api';
import toast from 'react-hot-toast';

// ─── RESIDENCE MUTATION HOOKS ───────────────────────────────────────────────────

export const useAddRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: residenceApi.addRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room added successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to add room');
    }
  });
};

export const useRemoveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: residenceApi.removeRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      queryClient.invalidateQueries({ queryKey: ['targettedUsers'] });
      toast.success('Room removed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to remove room');
    }
  });
};

export const useAssignRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: residenceApi.assignRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      queryClient.invalidateQueries({ queryKey: ['targettedUsers'] });
      toast.success('User assigned to room successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to assign user');
    }
  });
};

export const useRemoveStudentFromRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: residenceApi.removeStudentFromRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      queryClient.invalidateQueries({ queryKey: ['targettedUsers'] });
      toast.success('User removed from room successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to remove user from room');
    }
  });
};

export const useSwapRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: residenceApi.swapRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      queryClient.invalidateQueries({ queryKey: ['targettedUsers'] });
      toast.success('User room swapped successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to swap room');
    }
  });
};
