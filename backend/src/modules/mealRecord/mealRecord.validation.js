import { z } from 'zod';

// A strict Regex to ensure dates always arrive exactly as "YYYY-MM-DD"
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// 👇 SCHEMA 1: For the Student selecting a meal in advance
export const bulkSelectMealsSchema = z.object({
  selections: z.array(z.object({
    date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
    mealType: z.string().min(1, "Meal type is required"),
    mealInfo: z.object({
      name: z.string(),
      price: z.number().min(0, "Price cannot be negative")
    }),
    count: z.number().int().min(0, "Count must be positive")
  }))
}).strict();

// 👇 SCHEMA 2: For the Manager/Scanner logging attendance at the dining hall
export const markAttendanceSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required"),
  date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner']),
  
  // Zod ensures the manager logs at least 1 plate
  count: z.number().int().min(1, "Count must be at least 1"),
  
  isGuest: z.boolean().default(false),
  
  // We still need the snapshot here in case this is a Walk-In who didn't select earlier!
  mealInfo: z.object({
    name: z.string().min(1, "Meal name is required"),
    price: z.number().min(0, "Price cannot be negative")
  })
}).strict();