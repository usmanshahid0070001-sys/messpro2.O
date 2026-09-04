import express from 'express';
import { 
  getAttendance, 
  saveAttendance,
  getManagerQR,
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

// ── Manager Endpoints ────────────────────────────────────────────────────────
router.get('/qr/generate', requirePermission('qr_attendance'), getManagerQR);
router.get('/qr/live', requirePermission('qr_attendance'), getLiveQRAttendance);
router.get('/daily-overview', requirePermission('manual_attendance') || requirePermission('qr_attendance'), getDailyOverview);
router.post('/qr/scan-student', requirePermission('qr_attendance'), scanStudentQR);
router.post('/qr/respond-permission', requirePermission('qr_attendance'), respondGuestPermission);
router.post('/biometric/upload', requirePermission('biometric_attendance'), uploadBiometricAttendance);
router.get('/live-overview', requirePermission('meal_settings'), getManagerLiveOverview);

// ── Student Endpoints ────────────────────────────────────────────────────────
router.post('/qr/scan-manager', restrictTo('student'), scanManagerQR);
router.post('/qr/request-permission', restrictTo('student'), requestGuestPermission);
router.post('/selections', restrictTo('student'), bulkSelectMeals);
router.get('/selections', restrictTo('student'), getStudentSelections);
router.get('/monthly', restrictTo('student'), getStudentMonthlyRecords);

// ── Main Attendance Endpoints ────────────────────────────────────────────────
router
  .route('/')
  .get(requirePermission('manual_attendance'), getAttendance)
  .post(requirePermission('manual_attendance'), saveAttendance);

export default router;