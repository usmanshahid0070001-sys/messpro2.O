import express from 'express';
import { getTargetedUsers, updateExistingUser } from './user.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// 1. Ensure all these routes require the user to be logged in
router.use(protect);

// 2. We allow superadmins, admins, and managers to hit this route. 
// (The Service layer handles the actual filtering logic!)
router.get('/', restrictTo('superadmin', 'admin', 'manager'), getTargetedUsers);

router.patch('/:id', restrictTo('superadmin', 'admin', 'manager'), updateExistingUser);

export default router;