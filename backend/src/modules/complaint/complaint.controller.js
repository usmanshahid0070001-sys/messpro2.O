import { catchAsync } from '../../utils/catchAsync.js';
import * as complaintService from './complaint.service.js';
import { createComplaintSchema, updateComplaintStatusSchema } from './complaint.validation.js';

export const createComplaint = catchAsync(async (req, res) => {
  const validatedData = createComplaintSchema.parse(req.body);

  const complaintData = {
    ...validatedData,
    hostelid: req.user.hostelId,
    roomid: req.user.room ? req.user.room : null, // Must be null or ObjectId, not string
    roll_number: req.user.id,
  };
  const complaint = await complaintService.createComplaint(complaintData);
  res.status(201).send(complaint);
});

export const getStudentComplaints = catchAsync(async (req, res) => {
  const rollNumber = req.user.roll_number || req.user.id;
  const complaints = await complaintService.getStudentComplaints(rollNumber);
  res.send(complaints);
});

export const getComplaints = catchAsync(async (req, res) => {
  const { status } = req.query;
  const hostelId = req.user.hostelid || req.user.hostelId; // Add fallback for hostelId as well
  
  // If the admin is superadmin, they might see all hostels. But for now, we filter by what's passed or user's hostel.
  const complaints = await complaintService.getComplaints(status, req.user.role !== 'superadmin' ? hostelId : null);
  res.send(complaints);
});

export const deleteComplaint = catchAsync(async (req, res) => {
  const rollNumber = req.user.roll_number || req.user.id;
  await complaintService.deleteComplaint(req.params.id, rollNumber);
  res.status(204).send();
});

export const updateComplaintStatus = catchAsync(async (req, res) => {
  const { status } = updateComplaintStatusSchema.parse(req.body);
  const complaint = await complaintService.updateComplaintStatus(req.params.id, status);
  res.send(complaint);
});
