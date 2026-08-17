import express from 'express';
import { 
  buildNewRoom, 
  fetchAllRooms, 
  assignRoom, 
  removeStudentFromRoom, 
  swapRoom, 
  removeRoom,
  getMyRoomDetails,
  markRoomCleaning
} from './residence.controller.js';
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// 1. Lock down the entire router - You must be logged in
router.use(protect);

// 2. STUDENT ROUTES (My Room)
router.get('/my-room', restrictTo('student', 'manager'), getMyRoomDetails);
router.post('/my-room/cleaning', restrictTo('student', 'manager'), markRoomCleaning);

// Permitted Routes to admin, permitted manager and student
// 3. Room Allocation
router.post('/', requirePermission('residence_management'), buildNewRoom);
router.delete('/:id', requirePermission('residence_management'), removeRoom);
router.post('/allote', requirePermission('residence_management'), assignRoom);
router.post('/disallote', requirePermission('residence_management'), removeStudentFromRoom);
router.post('/change', requirePermission('residence_management'), swapRoom);
// Room allocation + Room Service section to show the cleaning records
router.get('/', requirePermission('residence_management'), fetchAllRooms);

export default router;