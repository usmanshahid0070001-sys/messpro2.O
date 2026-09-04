import { z } from 'zod';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Flexible menu item schema supporting both 'meal' and 'name'
export const menuItemSchema = z.object({
  meal: z.string().optional(),
  name: z.string().optional(),
  price: z.coerce.number().min(0, 'Price cannot be negative').default(0),
}).transform((item) => ({
  meal: (item.meal || item.name || '').trim() || 'none',
  price: item.price,
}));

// Flexible time window schema supporting both formatted strings and { start, end } objects
export const timeWindowSchema = z.union([
  z.string().transform((val) => {
    const parts = val.split('–').map(s => s.trim());
    if (parts.length === 2) {
      return { start: parts[0], end: parts[1] };
    }
    return { start: val.trim(), end: val.trim() };
  }),
  z.object({
    start: z.string().default(''),
    end: z.string().default(''),
  }),
]);

const daysOfWeekSchema = z.object({
  Monday: z.array(menuItemSchema).optional(),
  Tuesday: z.array(menuItemSchema).optional(),
  Wednesday: z.array(menuItemSchema).optional(),
  Thursday: z.array(menuItemSchema).optional(),
  Friday: z.array(menuItemSchema).optional(),
  Saturday: z.array(menuItemSchema).optional(),
  Sunday: z.array(menuItemSchema).optional(),
});

// Update / Upsert Meal Schedule Schema
export const mealScheduleSchema = z.object({
  groupId: z.string().nullable().optional(),
  numberOfMeals: z.coerce.number().int().min(1, 'At least 1 meal required').max(10, 'Maximum 10 meals allowed').optional(),
  mealNames: z.array(z.string().trim().min(1, 'Meal slot name cannot be empty')).optional(),
  selectionTiming: z.array(timeWindowSchema).optional(),
  servingTiming: z.array(timeWindowSchema).optional(),
  maxMealSelection: z.coerce.number().int().min(1, 'Minimum 1 meal selection required').max(10, 'Maximum 10 meals allowed').optional(),
  menu: daysOfWeekSchema.optional(),
  status: z.enum(['active', 'inactive']).default('active').optional(),
}).strict();

// Query parameter validator for violations sheet
export const mealViolationQuerySchema = z.object({
  date: z.string().regex(DATE_REGEX, 'Date must be formatted as YYYY-MM-DD (e.g., 2026-09-04)'),
  hostelId: z.string().regex(OBJECT_ID_REGEX, 'Invalid Hostel ID format').optional(),
});

// Query parameter validator for fetching meal schedule
export const mealScheduleQuerySchema = z.object({
  hostelId: z.string().regex(OBJECT_ID_REGEX, 'Invalid Hostel ID format').optional(),
});