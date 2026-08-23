import express from 'express';
import * as mealController from './meal.controller.js';
// Assuming 'protect' is your standard login verification middleware
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js'; 

const router = express.Router();

// Both routes require the user to be logged in
router.use(protect);

router.get('/', restrictTo('admin', 'manager', 'student'), mealController.getMealSchedule);
router.put('/', requirePermission('meal_settings'), mealController.updateMealSchedule);
// Add this under your // Manager endpoints section
router.get('/violations', requirePermission('manual_attendance'), mealController.getMealViolationsSheet);

export default router;