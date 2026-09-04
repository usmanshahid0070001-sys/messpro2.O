import { catchAsync } from '../../utils/catchAsync.js';
import * as complaintService from './complaint.service.js';
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
  complaintFilterQuerySchema,
  complaintIdParamSchema,
} from './complaint.validation.js';

export const createComplaint = catchAsync(async (req, res) => {
  if (req.user?.status === 'Suspended') {
    const error = new Error('Your account is currently suspended. You cannot file complaints while suspended.');
    error.statusCode = 403;
    throw error;
  }

  const validatedData = createComplaintSchema.parse(req.body);

  const hostelId = req.user.hostelId || req.user.hostelid;
  if (!hostelId) {
    const error = new Error('You must belong to a hostel to file a complaint.');
    error.statusCode = 400;
    throw error;
  }

  // In auth.model, student roll number is stored in .id or .roll_number
  const rollNumber = req.user.id || req.user.roll_number || 'N/A';

  const complaintData = {
    ...validatedData,
    studentId: req.user._id,
    hostelid: hostelId,
    roomid: req.user.room || null,
    roll_number: rollNumber,
  };

  const complaint = await complaintService.createComplaint(complaintData);
  res.status(201).json(complaint);
});

export const getStudentComplaints = catchAsync(async (req, res) => {
  const studentId = req.user._id;
  const rollNumber = req.user.id || req.user.roll_number;
  const hostelId = req.user.hostelId || req.user.hostelid;

  const complaints = await complaintService.getStudentComplaints(studentId, rollNumber, hostelId);
  res.json(complaints);
});

export const getComplaintStats = catchAsync(async (req, res) => {
  let targetHostelId = req.user.hostelId || req.user.hostelid;
  if (req.user.role === 'superadmin' && req.query.hostelId) {
    targetHostelId = req.query.hostelId;
  } else if (req.user.role === 'superadmin' && !req.query.hostelId) {
    targetHostelId = null;
  }

  const stats = await complaintService.getComplaintStats(targetHostelId);
  res.json({ success: true, data: stats });
});

export const getComplaints = catchAsync(async (req, res) => {
  const validatedQuery = complaintFilterQuerySchema.parse(req.query);

  let targetHostelId = req.user.hostelId || req.user.hostelid;
  if (req.user.role === 'superadmin') {
    targetHostelId = req.query.hostelId || null;
  }

  const complaints = await complaintService.getComplaints({
    statusFilter: validatedQuery.status,
    intensity: validatedQuery.intensity,
    category: validatedQuery.category,
    search: validatedQuery.search,
    startDate: validatedQuery.startDate,
    endDate: validatedQuery.endDate,
    page: validatedQuery.page,
    limit: validatedQuery.limit,
    hostelId: targetHostelId,
  });

  res.json(complaints);
});

export const deleteComplaint = catchAsync(async (req, res) => {
  const { id } = complaintIdParamSchema.parse(req.params);
  await complaintService.deleteComplaint(id, req.user);
  res.status(204).send();
});

export const updateComplaintStatus = catchAsync(async (req, res) => {
  const { id } = complaintIdParamSchema.parse(req.params);
  const { status } = updateComplaintStatusSchema.parse(req.body);

  const hostelId = req.user.role === 'superadmin' ? null : (req.user.hostelId || req.user.hostelid);

  const complaint = await complaintService.updateComplaintStatus(id, status, hostelId);
  res.status(200).json({ success: true, data: complaint });
});

