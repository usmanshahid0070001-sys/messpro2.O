import express from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import * as notificationController from './notification.controller.js';

const router = express.Router();

// Require authentication for all notification routes
router.use(protect);

// Save / update push subscription for current user
router.post(
    '/subscribe',
    restrictTo('student', 'admin', 'superadmin', 'manager'),
    notificationController.subscribeToNotifications
);

// Test push notification endpoint (for immediate verification)
router.post(
    '/test',
    restrictTo('student', 'admin', 'superadmin', 'manager'),
    notificationController.sendTestNotification
);

export default router;
