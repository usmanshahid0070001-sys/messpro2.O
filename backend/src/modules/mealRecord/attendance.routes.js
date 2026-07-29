import express from 'express';
import { 
  getAttendance, 
  saveAttendance,
  getManagerQR, // Fixed from generateManagerQR
  scanManagerQR,
  requestGuestPermission,
  respondGuestPermission,
  scanStudentQR,
  getLiveQRAttendance,
  getDailyOverview,
  bulkSelectMeals,
  getStudentSelections
} from './mealRecord.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Manager endpoints
router.get('/qr/generate', restrictTo('admin', 'manager'), getManagerQR);
router.get('/qr/live', restrictTo('admin', 'manager'), getLiveQRAttendance);
router.get('/daily-overview', restrictTo('admin', 'manager'), getDailyOverview);
router.post('/qr/scan-student', restrictTo('admin', 'manager'), scanStudentQR);
router.post('/qr/respond-permission', restrictTo('admin', 'manager'), respondGuestPermission);

// Student endpoints (students do not need take_attendance permission to scan)
router.post('/qr/scan-manager', scanManagerQR);
router.post('/qr/request-permission', requestGuestPermission);
router.post('/selections', bulkSelectMeals);
router.get('/selections', getStudentSelections);

// Main attendance endpoints
router
  .route('/')
  .get(restrictTo('admin', 'manager'), getAttendance)
  .post(restrictTo('admin', 'manager'), saveAttendance);

export default router;
