import express from 'express';
import { getTargetedUsers, updateExistingUser, createUser } from './user.controller.js';
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// 1. Ensure all these routes require the user to be logged in
router.use(protect);

// 2. We allow superadmins, admins, and anyone with user_management permission
router.get('/', requirePermission('user_management'), getTargetedUsers);

router.patch('/:id', requirePermission('user_management'), updateExistingUser);

// 👇 FIX: Use 'createUser' directly instead of 'userController.createUser'
router.post(
  '/add', 
  requirePermission('user_management'), 
  createUser 
);

export default router;