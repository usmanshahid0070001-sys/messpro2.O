import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID format.'),
});

const additionalInfoItemSchema = z.object({
  key: z.string().trim().min(1, 'Field name/key is required.'),
  value: z.any().optional().transform((v) => (v === undefined || v === null ? '' : String(v).trim())),
});

// We ONLY allow specific fields to be updated.
// We strictly block 'role', 'password', or 'hostelId' from being changed here.
export const updateUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100, 'Name cannot exceed 100 characters.').optional(),
  additionalInfo: z.array(additionalInfoItemSchema).optional(),
  permissions: z.array(z.string().trim().min(1)).max(50).optional(),
}).strict(); // .strict() drops any unlisted fields, keeping you 100% secure!

export const addUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100, 'Name cannot exceed 100 characters.'),
  email: z.string().trim().email('Valid email is required.').toLowerCase(),
  role: z.enum(['student', 'manager', 'admin']),
  id: z.string().trim().min(1, 'Roll number / ID cannot be empty.').max(50).optional(),
  permissions: z.array(z.string().trim().min(1)).max(50).optional(),
  additionalInfo: z.array(additionalInfoItemSchema).optional().default([]),
}).strict();

