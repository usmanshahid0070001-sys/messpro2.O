import express from 'express';
import { 
  getAttendance, 
  saveAttendance,
  generateManagerQR,
  scanManagerQR,
  requestGuestPermission,
  respondGuestPermission,
  scanStudentQR,
  getLiveQRAttendance
} from './mealRecord.controller.js';
import { protect, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Manager endpoints
router.get('/qr/generate', requirePermission('take_attendance'), generateManagerQR);
router.get('/qr/live', requirePermission('take_attendance'), getLiveQRAttendance);
router.post('/qr/scan-student', requirePermission('take_attendance'), scanStudentQR);
router.post('/qr/respond-permission', requirePermission('take_attendance'), respondGuestPermission);

// Student endpoints (students do not need take_attendance permission to scan)
router.post('/qr/scan-manager', scanManagerQR);
router.post('/qr/request-permission', requestGuestPermission);

// Main attendance endpoints
router
  .route('/')
  .get(requirePermission('take_attendance'), getAttendance)
  .post(requirePermission('take_attendance'), saveAttendance);

export default router;
