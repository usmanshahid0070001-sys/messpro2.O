import express from 'express';
import { 
  buildNewRoom, 
  fetchAllRooms, 
  assignRoom, 
  removeStudentFromRoom, 
  swapRoom, 
  removeRoom 
} from './residence.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// 1. Lock down the entire router - You must be logged in
router.use(protect);

// 2. ADMIN ONLY ROUTES (Building and Destroying)
router.post('/', restrictTo('admin'), buildNewRoom);
router.delete('/:id', restrictTo('admin'), removeRoom);

// 3. ADMIN & MANAGER ROUTES (Day-to-day operations)
router.get('/', restrictTo('admin', 'manager'), fetchAllRooms);
router.post('/allote', restrictTo('admin', 'manager'), assignRoom);
router.post('/disallote', restrictTo('admin', 'manager'), removeStudentFromRoom);
router.post('/change', restrictTo('admin', 'manager'), swapRoom);

export default router;