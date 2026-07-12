import express from 'express';
import { createNewPlan, getPlans, updateExistingPlan } from './plan.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public / Authenticated Route (Hostel admins need to see the pricing to upgrade)
router.get('/', protect, getPlans);

// Strictly Super Admin Routes
router.use(protect, restrictTo('superadmin')); 
router.post('/', createNewPlan);
router.patch('/:id', updateExistingPlan);

export default router;