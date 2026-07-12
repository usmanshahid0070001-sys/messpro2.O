import express from 'express';
import {
  createHostel,
  getHostels,
  updateSettings,
  addHostelUser,
  getMyHostel,
  updateMyHostelSettings,
 
} from './hostel.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Tenant routes for current hostel
router.get('/my-hostel', protect, restrictTo('admin', 'manager'), getMyHostel);
router.patch('/my-hostel/settings', protect, restrictTo('admin'), updateMyHostelSettings);

// Super admin routes
router.route('/')
  .get(protect, restrictTo('superadmin'), getHostels)
  .post(protect, restrictTo('superadmin'), createHostel);

router.route('/:id/users').post(protect, restrictTo('superadmin', 'admin'), addHostelUser);
router.route('/:id/settings').patch(protect, restrictTo('superadmin'), updateSettings);

export default router;
