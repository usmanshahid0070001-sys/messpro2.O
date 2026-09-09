import { catchAsync } from '../../utils/catchAsync.js';
import mealService from './meal.service.js';
import {
  mealScheduleSchema,
  mealViolationQuerySchema,
  mealScheduleQuerySchema,
} from './meal.validation.js';

const resolveHostelId = (req) => {
  if (req.user.role === 'superadmin' && req.query.hostelId) {
    return req.query.hostelId;
  }
  return req.user.hostelId || req.user.hostelid;
};

/**
 * Get hostel weekly meal schedule (Admins, Managers, Students, Superadmin)
 */
export const getMealSchedule = catchAsync(async (req, res) => {
  const validatedQuery = mealScheduleQuerySchema.parse(req.query);
  const hostelId = req.user.role === 'superadmin' && validatedQuery.hostelId
    ? validatedQuery.hostelId
    : (req.user.hostelId || req.user.hostelid);

  if (!hostelId) {
    const error = new Error('You must be associated with a hostel to view its meal schedule.');
    error.statusCode = 400;
    throw error;
  }

  const schedule = await mealService.getScheduleByHostel(hostelId);

  res.status(200).json({
    success: true,
    data: schedule || null,
  });
});

/**
 * Update / Upsert hostel weekly meal schedule (Admin / Manager with 'meal_settings' permission)
 */
export const updateMealSchedule = catchAsync(async (req, res) => {
  const hostelId = resolveHostelId(req);

  if (!hostelId) {
    const error = new Error('You must be associated with a hostel to configure its meal schedule.');
    error.statusCode = 400;
    throw error;
  }

  const validatedData = mealScheduleSchema.parse(req.body);
  const updatedSchedule = await mealService.upsertSchedule(hostelId, validatedData);

  res.status(200).json({
    success: true,
    message: 'Meal schedule updated successfully.',
    data: updatedSchedule,
  });
});

/**
 * Manager / Admin / Superadmin: Generate Meal Violations & Wastage Sheet
 */
export const getMealViolationsSheet = catchAsync(async (req, res) => {
  const validatedQuery = mealViolationQuerySchema.parse(req.query);
  const hostelId = req.user.role === 'superadmin' && validatedQuery.hostelId
    ? validatedQuery.hostelId
    : (req.user.hostelId || req.user.hostelid);

  if (!hostelId) {
    const error = new Error('You must be associated with a hostel to fetch violations sheet.');
    error.statusCode = 400;
    throw error;
  }

  const violations = await mealService.getMealViolations(hostelId, validatedQuery.date);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Violation sheet generated successfully.',
    results: violations.length,
    data: violations,
  });
});
