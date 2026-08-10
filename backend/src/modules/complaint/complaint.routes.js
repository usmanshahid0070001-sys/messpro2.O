import express from 'express';
import { protect, requirePermission } from '../../middlewares/auth.middleware.js';
import validateRequest from '../../middlewares/validateRequest.middleware.js';
import { createComplaintSchema, updateComplaintStatusSchema } from './complaint.validation.js';
import * as complaintController from './complaint.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.post(
  '/',
  validateRequest(createComplaintSchema),
  complaintController.createComplaint
);

router.get(
  '/student',
  complaintController.getStudentComplaints
);

router.delete(
  '/:id',
  complaintController.deleteComplaint
);

// Admin / Management routes
router.get(
  '/',
  requirePermission('complaint_management'), // Assuming you have a role/permission like this
  complaintController.getComplaints
);

router.patch(
  '/:id/status',
  requirePermission('complaint_management'),
  validateRequest(updateComplaintStatusSchema),
  complaintController.updateComplaintStatus
);

export default router;
