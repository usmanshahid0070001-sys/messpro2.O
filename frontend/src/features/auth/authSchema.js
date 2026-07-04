import { z } from 'zod';

export const loginSchema = z.object({
  // Custom refinement to ensure the identifier is either 
  // a valid email OR a valid roll number format.
  identifier: z
    .string()
    .min(1, 'Roll Number or Email is required')
    .transform((val) => val.trim().toLowerCase()),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password is too long'),
});
