import { catchAsync } from '../../utils/catchAsync.js';
import mealService from './meal.service.js';
import { mealScheduleSchema } from './meal.validation.js';

export const getMealSchedule = catchAsync(async (req, res) => {
  // Everyone (Admins, Managers, Students) can view the menu
  const hostelId = req.user.hostelId;
  const schedule = await mealService.getScheduleByHostel(hostelId);

  res.status(200).json({
    success: true,
    data: schedule || null // Returns null if the manager hasn't created one yet
  });
});

export const updateMealSchedule = catchAsync(async (req, res) => {
  const hostelId = req.user.hostelId;
  const validatedData = mealScheduleSchema.parse(req.body);

  const updatedSchedule = await mealService.upsertSchedule(hostelId, validatedData);

  res.status(200).json({
    success: true,
    message: 'Meal schedule updated successfully.',
    data: updatedSchedule
  });
});