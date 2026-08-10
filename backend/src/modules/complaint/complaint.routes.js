import express from 'express';
import { protect, requirePermission, restrictTo } from '../../middlewares/auth.middleware.js';
import * as complaintController from './complaint.controller.js';

const router = express.Router();

router.use(protect);
//for student 
router.post('/',restrictTo('student'), complaintController.createComplaint);
router.get('/student',restrictTo('student'),complaintController.getStudentComplaints);
router.delete('/:id',restrictTo('student'),complaintController.deleteComplaint);

//for admin, permissions are inplemented
router.get('/',requirePermission('complaint_management'),complaintController.getComplaints);

router.patch('/:id/status',requirePermission('complaint_management'),complaintController.updateComplaintStatus);

export default router;
