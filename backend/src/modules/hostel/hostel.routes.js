import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createHostel,
  getHostels,
  getHostelById,
  updateSettings,
  addHostelUser,
  getMyHostel,
  updateMyHostelSettings,
  submitHostelRequest,
  getHostelRequests,
  approveHostelRequest,
  rejectHostelRequest,
  deleteHostel,
} from './hostel.controller.js';
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Strict Rate Limiter for public onboarding requests (max 5 requests per 15 minutes per IP)
const setupRequestLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many hostel setup requests from this IP address. Please try again after 30 minutes.',
  },
});

// ─── Public Hostel Setup Request Route ────────────────────────────────────────
router.post('/requests', setupRequestLimiter, submitHostelRequest);


// ─── Superadmin Request Management Routes ─────────────────────────────────────
router.get('/requests', protect, restrictTo('superadmin'), getHostelRequests);
router.post('/requests/:id/approve', protect, restrictTo('superadmin'), approveHostelRequest);
router.post('/requests/:id/reject', protect, restrictTo('superadmin'), rejectHostelRequest);

// Tenant routes for current logged-in user's hostel
router.get('/my-hostel', protect, restrictTo('admin', 'manager', 'student'), getMyHostel);
router.patch(
  '/my-hostel/settings',
  protect,
  restrictTo('admin'),
  requirePermission('hostel_configuration'),
  updateMyHostelSettings
);

// Superadmin collection routes
router.route('/')
  .get(protect, restrictTo('superadmin'), getHostels)
  .post(protect, restrictTo('superadmin'), createHostel);

// User addition under a specific hostel
router.route('/:id/users')
  .post(
    protect,
    requirePermission('user_management'),
    addHostelUser
  );

// Single hostel lookup (Superadmin or authorized tenant member) and Superadmin deletion
router.route('/:id')
  .get(protect, restrictTo('superadmin', 'admin', 'manager', 'student'), getHostelById)
  .delete(protect, restrictTo('superadmin'), deleteHostel);

// Superadmin hostel update (plan, subscription, status, configuration)
router.route('/:id/settings')
  .patch(protect, restrictTo('superadmin'), updateSettings);

export default router;
