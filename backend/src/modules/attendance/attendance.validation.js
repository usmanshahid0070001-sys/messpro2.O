import { z } from 'zod';

const recordSchema = z.object({
  rollNumber: z.string().min(1, 'Roll number is required'),
  count: z.number().min(0, 'Count must be 0 or greater')
});

export const getAttendanceSchema = z.object({
  hostelId: z.string().min(1, 'Hostel ID is required'),
  date: z.string().min(1, 'Date is required'),
  mealType: z.string().min(1, 'Meal type is required')
});

export const saveAttendanceSchema = z.object({
  hostelId: z.string().min(1, 'Hostel ID is required'),
  date: z.string().min(1, 'Date is required'),
  mealType: z.string().min(1, 'Meal type is required'),
  mealInfo: z.object({
    name: z.string(),
    price: z.number().min(0)
  }),
  records: z.array(recordSchema)
});
