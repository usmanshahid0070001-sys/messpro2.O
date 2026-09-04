import express from 'express';
import {
  createHostel,
  getHostels,
  getHostelById,
  updateSettings,
  addHostelUser,
  getMyHostel,
  updateMyHostelSettings,
} from './hostel.controller.js';
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

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
    restrictTo('superadmin', 'admin', 'manager'),
    requirePermission('user_management'),
    addHostelUser
  );

// Single hostel lookup (Superadmin or authorized tenant member)
router.route('/:id')
  .get(protect, restrictTo('superadmin', 'admin', 'manager', 'student'), getHostelById);

// Superadmin hostel update (plan, subscription, status, configuration)
router.route('/:id/settings')
  .patch(protect, restrictTo('superadmin'), updateSettings);

export default router;
