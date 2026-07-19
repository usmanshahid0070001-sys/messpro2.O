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
  // THE BOUNCER: Only Admins and Managers can edit the menu
  if (!['superadmin', 'admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access Denied: Only admins and managers can update the meal schedule.' 
    });
  }

  const hostelId = req.user.hostelId;
  const validatedData = mealScheduleSchema.parse(req.body);

  const updatedSchedule = await mealService.upsertSchedule(hostelId, validatedData);

  res.status(200).json({
    success: true,
    message: 'Meal schedule updated successfully.',
    data: updatedSchedule
  });
});