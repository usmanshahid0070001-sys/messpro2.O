import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  id: z.string().min(2, 'Roll number is required.'),
  hostelId: z.string().min(1, 'Hostel ID is required.'),
  role: z.enum(['student', 'manager', 'admin', 'superadmin']).default('student'),
  email: z.string().email('A valid email is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  additionalInfo: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  additionalFunctionality: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('A valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});
