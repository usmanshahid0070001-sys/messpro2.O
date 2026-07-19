import { z } from 'zod';

const menuItemSchema = z.object({
  meal: z.string().min(1, "Meal name is required"),
  price: z.number().min(0, "Price cannot be negative")
});

// We make everything optional so they can update just one day if they want
export const mealScheduleSchema = z.object({
  groupId: z.string().nullable().optional(),
  numberOfMeals: z.number().min(1).optional(),
  mealNames: z.array(z.string()).optional(),
  selectionTiming: z.array(z.string()).optional(),
  menu: z.object({
    Monday: z.array(menuItemSchema).optional(),
    Tuesday: z.array(menuItemSchema).optional(),
    Wednesday: z.array(menuItemSchema).optional(),
    Thursday: z.array(menuItemSchema).optional(),
    Friday: z.array(menuItemSchema).optional(),
    Saturday: z.array(menuItemSchema).optional(),
    Sunday: z.array(menuItemSchema).optional(),
  }).optional(),
  status: z.enum(['active', 'inactive']).optional()
}).strict();