// import { z } from 'zod';

// // We ONLY allow specific fields to be updated.
// // We strictly block 'role', 'password', or 'hostelId' from being changed here.
// export const updateUserSchema = z.object({
//   name: z.string().min(2).optional(),
//   additionalInfo: z.array(z.any()).optional(),
//   additionalFunctionality: z.string().optional(),
// }).strict();


import { z } from 'zod';

const additionalInfoItemSchema = z.object({
  key: z.string().trim().min(1, 'Field name/key is required.'),
  value: z.any().optional().transform((v) => (v === undefined || v === null ? '' : String(v).trim())),
});

// We ONLY allow specific fields to be updated.
// We strictly block 'role', 'password', or 'hostelId' from being changed here.
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  additionalInfo: z.array(additionalInfoItemSchema).optional(),
  permissions: z.array(z.string()).optional(),
}).strict(); // .strict() drops any unlisted fields, keeping you 100% secure!

export const addUserSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Valid email is required.'),
  role: z.enum(['student', 'manager']),
  id: z.string().optional(),
  permissions: z.array(z.string()).max(50).optional(),
  additionalInfo: z.array(additionalInfoItemSchema).optional().default([]),
}).strict();
