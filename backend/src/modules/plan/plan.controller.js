import { catchAsync } from '../../utils/catchAsync.js';
import { createPlanSchema, updatePlanSchema } from './plan.validation.js';
import * as planService from './plan.service.js';

export const createNewPlan = catchAsync(async (req, res) => {
  const validatedData = createPlanSchema.parse(req.body);
  const plan = await planService.createPlan(validatedData);

  res.status(201).json({
    success: true,
    message: 'Plan created successfully.',
    data: plan,
  });
});

export const getPlans = catchAsync(async (req, res) => {
  // Check if they are superadmin to show inactive plans as well
  const isSuperAdmin = req.user?.role === 'superadmin';
  const plans = await planService.getAllPlans(isSuperAdmin);

  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans,
  });
});

export const updateExistingPlan = catchAsync(async (req, res) => {
  const planId = req.params.id;
  const validatedData = updatePlanSchema.parse(req.body);
  
  const updatedPlan = await planService.updatePlan(planId, validatedData);

  res.status(200).json({
    success: true,
    message: 'Plan updated successfully.',
    data: updatedPlan,
  });
});