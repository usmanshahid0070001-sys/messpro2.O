import planRepository from './plan.repository.js';

export const createPlan = async (planData) => {
  const existingPlan = await planRepository.findByName(planData.name);
  
  if (existingPlan) {
    const error = new Error('A plan with this name already exists.');
    error.statusCode = 409;
    throw error;
  }

  const newPlan = await planRepository.create(planData);
  return newPlan;
};

export const getAllPlans = async (includeInactive = false) => {
  // If Super Admin, show all. If public pricing page, show only active.
  const query = includeInactive ? {} : { isActive: true };
  return await planRepository.findAll(query, { price: 1 }); // Sort cheapest to most expensive
};

export const updatePlan = async (planId, updateData) => {
  const updatedPlan = await planRepository.findByIdAndUpdate(
    planId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedPlan) {
    const error = new Error('Plan not found.');
    error.statusCode = 404;
    throw error;
  }

  return updatedPlan;
};