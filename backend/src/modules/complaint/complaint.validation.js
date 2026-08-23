import { z } from 'zod';

export const createComplaintSchema = z.object({
  category: z.string().nonempty('Category is required'),
  intensity: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    errorMap: () => ({ message: 'Intensity must be Low, Medium, High, or Urgent' }),
  }),
  description: z.string().max(80, 'Description cannot exceed 80 characters'),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['Open', 'Assigned', 'In Progress', 'Resolved'], {
    errorMap: () => ({ message: 'Status must be Open, Assigned, In Progress, or Resolved' }),
  }),
});
