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

// Remove push subscription for current user
router.post(
  '/unsubscribe',
  restrictTo('student', 'admin', 'superadmin', 'manager'),
  notificationController.unsubscribeFromNotifications
);

// Test push notification endpoint (for immediate verification)
router.post(
  '/test',
  restrictTo('student', 'admin', 'superadmin', 'manager'),
  notificationController.sendTestNotification
);

// Broadcast notification to students (admin and superadmin only)
router.post(
  '/broadcast',
  restrictTo('admin', 'superadmin'),
  notificationController.broadcastNotification
);

// Get subscribed students for subscriber audit (admin and superadmin only)
router.get(
  '/subscribers',
  restrictTo('admin', 'superadmin'),
  notificationController.getSubscribers
);

export default router;
