import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Plan name is required.'),
  description: z.string().min(5, 'Description is required.'),
  price: z.number().min(0, 'Price cannot be negative.'),
  limits: z.object({
    maxStudents: z.number(),
    maxManagers: z.number(),
  }),
  features: z.object({
    allowedAttendanceMethods: z.array(z.enum(['Manual', 'QR', 'Biometric'])).default(['Manual']),
    allowedBillingModels: z.array(z.enum(['Prepaid', 'Postpaid', 'FlatRate'])).default(['Prepaid']),
    allowAutoMealVerification: z.boolean().default(false),
  }),
  isActive: z.boolean().optional().default(true),
});

export const updatePlanSchema = createPlanSchema.partial(); // Makes all fields optional for updates