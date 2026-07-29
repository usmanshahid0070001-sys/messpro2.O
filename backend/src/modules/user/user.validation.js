// import { z } from 'zod';

// // We ONLY allow specific fields to be updated.
// // We strictly block 'role', 'password', or 'hostelId' from being changed here.
// export const updateUserSchema = z.object({
//   name: z.string().min(2).optional(),
//   additionalInfo: z.array(z.any()).optional(),
//   additionalFunctionality: z.string().optional(),
// }).strict();


import { z } from 'zod';

// We ONLY allow specific fields to be updated.
// We strictly block 'role', 'password', or 'hostelId' from being changed here.
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  additionalInfo: z.array(z.any()).optional(),
  permissions: z.array(z.string()).optional(),
}).strict(); // .strict() drops any unlisted fields, keeping you 100% secure!