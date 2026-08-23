import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

import {
  register,
  login,
  verify,
  logout,
  googleAuth,
  googleCallback,
} from './auth.controller.js';

const router = express.Router();

const loginLimiter = rateLimit({
  max: 5, // Block after 5 failed attempts
  windowMs: 15 * 60 * 1000, // 15 minute lockout
  message: 'Too many login attempts from this IP, please try again after 15 minutes.'
});

// Account provisioning is performed by an authenticated platform administrator.
// Hostel staff use POST /api/users/add, which scopes creation to their tenant.
router.post('/register', protect, restrictTo('superadmin'), register);
router.post('/login',loginLimiter, login);
router.get('/verify', verify);
router.post('/logout', logout);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
