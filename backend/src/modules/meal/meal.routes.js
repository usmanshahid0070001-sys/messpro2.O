import express from 'express';
import * as mealController from './meal.controller.js';
// Assuming 'protect' is your standard login verification middleware
import { protect, restrictTo } from '../../middlewares/auth.middleware.js'; 

const router = express.Router();

// Both routes require the user to be logged in and explicitly block superadmin
router.use(protect); 
router.use(restrictTo('admin', 'manager'));

// The endpoint paths exactly match your teammate's requirements
router.get('/', mealController.getMealSchedule);
router.put('/', mealController.updateMealSchedule);

export default router;