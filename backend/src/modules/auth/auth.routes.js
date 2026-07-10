import express from 'express';
import {
  register,
  login,
  verify,
  logout,
  googleAuth,
  googleCallback,
} from './auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verify);
router.post('/logout', logout);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
