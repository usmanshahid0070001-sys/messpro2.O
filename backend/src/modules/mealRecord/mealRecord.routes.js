import express from 'express';
import rateLimit from 'express-rate-limit';
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
import { protect, restrictTo, requirePermission, requireAnyPermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// ── Rate Limiters for QR Attendance ──────────────────────────────────────────
const qrScanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many QR scan requests. Please wait a moment.'
  }
});

const permissionRequestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 6, // 6 permission requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many permission requests sent. Please wait for the manager to respond.'
  }
});

router.use(protect);

// ── Manager Endpoints ────────────────────────────────────────────────────────
router.get('/qr/generate', requirePermission('qr_attendance'), getManagerQR);
router.get('/qr/live', requirePermission('qr_attendance'), getLiveQRAttendance);
router.get('/daily-overview', requireAnyPermission('manual_attendance', 'qr_attendance'), getDailyOverview);
router.post('/qr/scan-student', qrScanLimiter, requirePermission('qr_attendance'), scanStudentQR);
router.post('/qr/respond-permission', requirePermission('qr_attendance'), respondGuestPermission);
router.post('/biometric/upload', requirePermission('biometric_attendance'), uploadBiometricAttendance);
router.get('/live-overview', requirePermission('meal_settings'), getManagerLiveOverview);

// ── Student Endpoints ────────────────────────────────────────────────────────
router.post('/qr/scan-manager', qrScanLimiter, restrictTo('student'), scanManagerQR);
router.post('/qr/request-permission', permissionRequestLimiter, restrictTo('student'), requestGuestPermission);
router.post('/selections', restrictTo('student'), bulkSelectMeals);
router.get('/selections', restrictTo('student'), getStudentSelections);
router.get('/monthly', restrictTo('student'), getStudentMonthlyRecords);

// ── Main Attendance Endpoints ────────────────────────────────────────────────
router
  .route('/')
  .get(requirePermission('manual_attendance'), getAttendance)
  .post(requirePermission('manual_attendance'), saveAttendance);

export default router;