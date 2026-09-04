import express from 'express';
import * as mealController from './meal.controller.js';
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// All meal endpoints require authentication
router.use(protect);

// 1. View weekly menu schedule (Superadmin, Admin, Manager, Student)
router.get('/', mealController.getMealSchedule);

// 2. Update weekly meal schedule (Admin & Manager with 'meal_settings' permission, or Superadmin)
router.put(
    '/',
    requirePermission('meal_settings'),
    mealController.updateMealSchedule
);

// 3. Managerial meal violation and wastage tracker
router.get(
    '/violations',
    requirePermission('manual_attendance'),
    mealController.getMealViolationsSheet
);

export default router;