import express from 'express';
import * as mealController from './meal.controller.js';
// Assuming 'protect' is your standard login verification middleware
import { protect, restrictTo } from '../../middlewares/auth.middleware.js'; 

const router = express.Router();

// Both routes require the user to be logged in
router.use(protect);

// The endpoint paths exactly match your teammate's requirements
router.get('/', restrictTo('admin', 'manager', 'student'), mealController.getMealSchedule);
router.put('/', restrictTo('admin', 'manager'), mealController.updateMealSchedule);

export default router;