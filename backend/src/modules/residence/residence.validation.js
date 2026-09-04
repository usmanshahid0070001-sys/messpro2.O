import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createRoomSchema = z.object({
  roomName: z
    .string({ required_error: 'Room name is required' })
    .trim()
    .min(1, 'Room name cannot be empty')
    .max(50, 'Room name cannot exceed 50 characters'),
  capacity: z
    .number({ required_error: 'Capacity is required' })
    .int('Capacity must be a whole number')
    .min(1, 'Room capacity must be at least 1 bed')
    .max(20, 'Room capacity cannot exceed 20 beds'),
}).strict();

export const alloteRoomSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(objectIdRegex, 'Invalid Student ID structure'),
  roomId: z
    .string({ required_error: 'Room ID is required' })
    .regex(objectIdRegex, 'Invalid Room ID structure'),
}).strict();

export const disalloteRoomSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(objectIdRegex, 'Invalid Student ID structure'),
}).strict();

export const changeRoomSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(objectIdRegex, 'Invalid Student ID structure'),
  newRoomId: z
    .string({ required_error: 'New Room ID is required' })
    .regex(objectIdRegex, 'Invalid New Room ID structure'),
}).strict();

export const roomIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Room ID parameter is required' })
    .regex(objectIdRegex, 'Invalid Room ID format in URL parameter'),
});