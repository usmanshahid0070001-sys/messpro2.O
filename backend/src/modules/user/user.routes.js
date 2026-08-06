import express from 'express';
import { getTargetedUsers, updateExistingUser, createUser, signAgreementHandler } from './user.controller.js';
import { protect, restrictTo, requirePermission } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// All user routes require a valid JWT session
router.use(protect);

// ─── Agreement ────────────────────────────────────────────────────────────────
// Any authenticated user can sign their own agreement — no permission gate needed
router.post('/sign-agreement', signAgreementHandler);

// ─── User Management ──────────────────────────────────────────────────────────
router.get('/', requirePermission('user_management'), getTargetedUsers);
router.patch('/:id', requirePermission('user_management'), updateExistingUser);
router.post('/add', requirePermission('user_management'), createUser);

export default router;
