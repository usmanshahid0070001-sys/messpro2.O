import express from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import * as notificationController from './notification.controller.js';

const router = express.Router();

router.use(protect);

// Post a new push subscription
router.post('/subscribe', restrictTo('student', 'admin', 'superadmin', 'manager'), notificationController.subscribeToNotifications);

// Test push notification (for immediate verification)
router.post('/test', restrictTo('student', 'admin', 'superadmin', 'manager'), notificationController.sendTestNotification);

export default router;

