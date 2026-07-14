import { z } from 'zod';

export const createRoomSchema = z.object({
  roomName: z.string().min(1, 'Room name is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
}).strict();

export const alloteRoomSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
}).strict();

export const changeRoomSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  newRoomId: z.string().min(1, 'New Room ID is required'),
}).strict();