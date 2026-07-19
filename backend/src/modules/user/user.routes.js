import express from 'express';
import { getTargetedUsers, updateExistingUser, createUser } from './user.controller.js';
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// 1. Ensure all these routes require the user to be logged in
router.use(protect);

// 2. We allow superadmins, admins, and managers to hit this route. 
router.get('/', restrictTo('superadmin', 'admin', 'manager'), getTargetedUsers);

router.patch('/:id', restrictTo('superadmin', 'admin', 'manager'), updateExistingUser);

// 👇 FIX: Use 'createUser' directly instead of 'userController.createUser'
router.post(
  '/add', 
  requirePermission('add_student'), 
  createUser 
);

export default router;