import express from 'express';
import { getAttendance, saveAttendance } from './attendance.controller.js';
import { protect, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Use requirePermission to align with the rest of the module architecture
router
  .route('/')
  .get(requirePermission('take_attendance'), getAttendance)
  .post(requirePermission('take_attendance'), saveAttendance);

export default router;
