import { z } from 'zod';

export const createComplaintSchema = z.object({
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(2, 'Category must be at least 2 characters')
    .max(60, 'Category cannot exceed 60 characters'),
  intensity: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    errorMap: () => ({ message: 'Intensity must be Low, Medium, High, or Urgent' }),
  }),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description cannot exceed 500 characters'),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['Open', 'Assigned', 'In Progress', 'Resolved'], {
    errorMap: () => ({ message: 'Status must be Open, Assigned, In Progress, or Resolved' }),
  }),
});

export const complaintFilterQuerySchema = z.object({
  status: z.string().optional(),
  intensity: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(200).optional().default(100),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const complaintIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid complaint ID format'),
});

