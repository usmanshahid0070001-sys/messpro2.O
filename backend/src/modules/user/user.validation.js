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
  
  // 👇 The new Sparse Array permissions validation
  permissions: z.array(
    z.enum([
      'add_student', 
      'edit_menu', 
      'manage_complaints', 
      'take_attendance', 
      'view_reports',
      'meal_settings',
      'user_management',
      'residence_management',
      'service_management'
    ])
  ).optional(),

}).strict(); // .strict() drops any unlisted fields, keeping you 100% secure!