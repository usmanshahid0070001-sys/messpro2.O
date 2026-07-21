import express from 'express';
import { 
  buildNewRoom, 
  fetchAllRooms, 
  assignRoom, 
  removeStudentFromRoom, 
  swapRoom, 
  removeRoom 
} from './residence.controller.js';
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// 1. Lock down the entire router - You must be logged in
router.use(protect);

// 2. ADMIN ONLY ROUTES (Building and Destroying)
router.post('/', requirePermission('residence_management'), buildNewRoom);
router.delete('/:id', requirePermission('residence_management'), removeRoom);

// 3. ADMIN & MANAGER ROUTES (Day-to-day operations)
router.get('/', requirePermission('residence_management'), fetchAllRooms);
router.post('/allote', requirePermission('residence_management'), assignRoom);
router.post('/disallote', requirePermission('residence_management'), removeStudentFromRoom);
router.post('/change', requirePermission('residence_management'), swapRoom);

export default router;