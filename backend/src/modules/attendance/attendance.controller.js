import { catchAsync } from '../../utils/catchAsync.js';
import attendanceService from './attendance.service.js';
import { getAttendanceSchema, saveAttendanceSchema } from './attendance.validation.js';

export const getAttendance = catchAsync(async (req, res, next) => {
  // Validate query parameters
  const { hostelId, date, mealType } = getAttendanceSchema.parse(req.query);

  // SECURITY CHECK: Tenant Isolation
  if (req.user.role !== 'superadmin' && req.user.hostelId.toString() !== hostelId.toString()) {
    const error = new Error('Access denied: You can only access attendance for your own hostel.');
    error.statusCode = 403;
    throw error;
  }

  const attendances = await attendanceService.getAttendance(hostelId, date, mealType);

  res.status(200).json({
    status: 'success',
    results: attendances.length,
    data: attendances,
  });
});

export const saveAttendance = catchAsync(async (req, res, next) => {
  // Validate request body
  const { hostelId, date, mealType, mealInfo, records } = saveAttendanceSchema.parse(req.body);

  // SECURITY CHECK: Tenant Isolation
  if (req.user.role !== 'superadmin' && req.user.hostelId.toString() !== hostelId.toString()) {
    const error = new Error('Access denied: You can only modify attendance for your own hostel.');
    error.statusCode = 403;
    throw error;
  }

  const recordedBy = req.user._id;

  // Perform business logic in the service layer
  await attendanceService.upsertAttendance(hostelId, date, mealType, mealInfo, records, recordedBy);

  res.status(200).json({
    status: 'success',
    message: 'Attendance saved successfully',
  });
});

// ==========================================
// QR ATTENDANCE LOGIC
// ==========================================

import jwt from 'jsonwebtoken';
import { io } from '../../server.js';
import User from '../auth/auth.model.js';

export const generateManagerQR = catchAsync(async (req, res) => {
  const { hostelId } = req.user;
  const qrData = attendanceService.generateManagerQRToken(hostelId);
  
  res.status(200).json({
    status: 'success',
    data: qrData
  });
});

import Attendance from './attendance.model.js';
export const getLiveQRAttendance = catchAsync(async (req, res) => {
  const { hostelId } = req.user;
  
  // Calculate current meal to get the exact date and mealType
  const mealData = await attendanceService.calculateCurrentMeal(hostelId);
  
  // Fetch all attendees for this meal
  const attendances = await Attendance.find({
    hostel: hostelId,
    date: mealData.date,
    mealType: mealData.mealType
  }).populate('userRef', 'name id');

  const formatted = attendances.map(att => ({
    name: att.userRef?.name || 'Unknown',
    rollNumber: att.userRef?.id || att.rollNumber,
    isGuest: att.isGuest,
    count: att.count
  }));

  res.status(200).json({
    status: 'success',
    data: formatted
  });
});

export const scanManagerQR = catchAsync(async (req, res) => {
  const { token } = req.body;
  const student = req.user;

  if (student.role !== 'student') {
    throw Object.assign(new Error('Only students can scan this QR code.'), { statusCode: 403 });
  }

  // Verify the QR token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'messpro-dev-secret');
  } catch (err) {
    throw Object.assign(new Error('Invalid or expired QR code.'), { statusCode: 400 });
  }

  const managerHostelId = decoded.hostelId;

  // Check if student belongs to the same hostel
  if (student.hostelId.toString() === managerHostelId) {
    // Mark attendance automatically
    const mealData = await attendanceService.markAttendance(managerHostelId, student, false);
    return res.status(200).json({
      status: 'success',
      message: 'Attendance marked successfully',
      data: mealData
    });
  } else {
    // Cross-hostel guest scan -> Requires Permission
    return res.status(200).json({
      status: 'requires_permission',
      managerHostelId,
      message: 'You are not registered in this hostel. Do you want to request guest permission?'
    });
  }
});

export const requestGuestPermission = catchAsync(async (req, res) => {
  const { managerHostelId } = req.body;
  const student = req.user;

  // Emit live socket event to manager's room
  io.to(managerHostelId.toString()).emit('guest_permission_request', {
    requestId: `${student._id}_${Date.now()}`,
    rollNumber: student.id,
    name: student.name,
    studentId: student._id,
    sourceHostelId: student.hostelId
  });

  res.status(200).json({
    status: 'success',
    message: 'Permission request sent to manager.'
  });
});

export const respondGuestPermission = catchAsync(async (req, res) => {
  const { requestId, studentId, isApproved } = req.body;
  const managerHostelId = req.user.hostelId;

  if (!isApproved) {
    return res.status(200).json({ status: 'success', message: 'Rejected.' });
  }

  const student = await User.findById(studentId);
  if (!student) throw new Error('Student not found');

  const mealData = await attendanceService.markAttendance(managerHostelId, student, true);

  res.status(200).json({
    status: 'success',
    message: 'Guest approved and attendance marked.',
    data: mealData
  });
});

export const scanStudentQR = catchAsync(async (req, res) => {
  const { studentRollNumber } = req.body;
  const managerHostelId = req.user.hostelId;

  const student = await User.findOne({ id: studentRollNumber, role: 'student' });
  if (!student) {
    throw Object.assign(new Error('Student not found.'), { statusCode: 404 });
  }

  if (student.hostelId.toString() === managerHostelId.toString()) {
    // Same hostel, mark automatically
    const mealData = await attendanceService.markAttendance(managerHostelId, student, false);
    return res.status(200).json({
      status: 'success',
      message: 'Attendance marked successfully.',
      data: mealData
    });
  } else {
    // Different hostel, UI should prompt manager
    return res.status(200).json({
      status: 'requires_permission',
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.id,
        hostelId: student.hostelId
      },
      message: 'This student is from a different hostel. Accept as guest?'
    });
  }
});

