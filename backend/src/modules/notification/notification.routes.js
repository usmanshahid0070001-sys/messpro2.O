import express from 'express';
import { protect, authorizeRoles } from '../../middlewares/auth.middleware.js';
import * as notificationController from './notification.controller.js';

const router = express.Router();

router.use(protect);

// Post a new push subscription
router.post('/subscribe', authorizeRoles('student', 'admin', 'superadmin', 'manager'), notificationController.subscribeToNotifications);

export default router;
