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
  getManagerLiveOverview,
  bulkSelectMeals,
  getStudentSelections,
  getStudentMonthlyRecords,
  uploadBiometricAttendance
} from './mealRecord.controller.js';
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Manager endpoints
router.get('/qr/generate', requirePermission('qr_attendance'), getManagerQR);
router.get('/qr/live', requirePermission('qr_attendance'), getLiveQRAttendance);
router.get('/daily-overview', requirePermission('manual_attendance'), getDailyOverview);
router.post('/qr/scan-student', requirePermission('qr_attendance'), scanStudentQR);
router.post('/qr/respond-permission', requirePermission('qr_attendance'), respondGuestPermission);
router.post('/biometric/upload', requirePermission('biometric_attendance'), uploadBiometricAttendance);

// Student endpoints (students do not need take_attendance permission to scan)
router.post('/qr/scan-manager', scanManagerQR);
router.post('/qr/request-permission', requestGuestPermission);
router.post('/selections', bulkSelectMeals);
router.get('/selections', getStudentSelections);
router.get('/monthly', getStudentMonthlyRecords);

// Main attendance endpoints
router
.route('/')
.get(restrictTo('admin', 'manager'), getAttendance)
.post(restrictTo('admin', 'manager'), saveAttendance);

// new updated live overview route 
router.get('/live-overview', requirePermission('meal_settings'), getManagerLiveOverview);

export default router;