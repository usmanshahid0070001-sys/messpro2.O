import { catchAsync } from '../../utils/catchAsync.js';
import * as complaintService from './complaint.service.js';

export const createComplaint = catchAsync(async (req, res) => {
  if (req.user.role !== 'student') {
    const error = new Error('Only students can file complaints');
    error.statusCode = 403;
    throw error;
  }

  const complaintData = {
    ...req.body,
    hostelid: req.user.hostelId,
    roomid: req.user.room,
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
  const complaint = await complaintService.updateComplaintStatus(req.params.id, req.body.status);
  res.send(complaint);
});
