import { catchAsync } from '../../utils/catchAsync.js';
import mealRecordService from './mealRecord.service.js';
import {
  bulkSelectMealsSchema,
  getStudentSelectionsQuerySchema,
  getStudentMonthlyRecordsQuerySchema,
  getAttendanceSchema,
  saveAttendanceSchema,
  dateQuerySchema,
  scanManagerQRSchema,
  requestGuestPermissionSchema,
  respondGuestPermissionSchema,
  scanStudentQRSchema,
  processBiometricAttendanceSchema
} from './mealRecord.validation.js';

// ==========================================
// 1. STUDENT FEATURE: PRE-SELECTION
// ==========================================

export const bulkSelectMeals = catchAsync(async (req, res) => {
  const student = req.user;
  const result = await mealRecordService.bulkSelectMeals(student, student.hostelId, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Meal selections saved successfully!',
    data: result
  });
});

export const getStudentSelections = catchAsync(async (req, res) => {
  const { startDate, endDate } = getStudentSelectionsQuerySchema.parse(req.query);
  const student = req.user;

  const records = await mealRecordService.getStudentSelections(student.id, student.hostelId, startDate, endDate);

  res.status(200).json({
    status: 'success',
    data: records
  });
});

export const getStudentMonthlyRecords = catchAsync(async (req, res) => {
  const { month } = getStudentMonthlyRecordsQuerySchema.parse(req.query);
  const student = req.user;

  const records = await mealRecordService.getStudentMonthlyRecords(student.id, student.hostelId, month);

  res.status(200).json({
    status: 'success',
    data: records
  });
});

// ==========================================
// 2. MANAGER FEATURES: FETCH & BULK SAVE
// ==========================================

export const getAttendance = catchAsync(async (req, res) => {
  const { hostelId, date, mealType } = getAttendanceSchema.parse(req.query);

  if (req.user.role !== 'superadmin' && req.user.hostelId?.toString() !== hostelId.toString()) {
    const error = new Error('Access denied: You can only access attendance for your own hostel.');
    error.statusCode = 403;
    throw error;
  }

  const attendances = await mealRecordService.getAttendance(hostelId, date, mealType);

  res.status(200).json({
    status: 'success',
    results: attendances.length,
    data: attendances,
  });
});

export const saveAttendance = catchAsync(async (req, res) => {
  const { hostelId, date, mealType, mealInfo, records } = saveAttendanceSchema.parse(req.body);

  if (req.user.role !== 'superadmin' && req.user.hostelId?.toString() !== hostelId.toString()) {
    const error = new Error('Access denied: You can only modify attendance for your own hostel.');
    error.statusCode = 403;
    throw error;
  }

  const recordedBy = req.user._id;
  await mealRecordService.upsertAttendance(hostelId, date, mealType, mealInfo, records, recordedBy);

  res.status(200).json({
    status: 'success',
    message: 'Attendance saved successfully',
  });
});

// ==========================================
// 3. QR ATTENDANCE LOGIC
// ==========================================

export const getManagerQR = catchAsync(async (req, res) => {
  const hostelId = req.user.hostelId;
  if (!hostelId) {
    const error = new Error('Manager is not assigned to a hostel.');
    error.statusCode = 400;
    throw error;
  }

  const qrData = await mealRecordService.getManagerQR(hostelId);

  res.status(200).json({
    status: 'success',
    data: qrData
  });
});

export const getLiveQRAttendance = catchAsync(async (req, res) => {
  const { hostelId } = req.user;
  const { date } = dateQuerySchema.parse(req.query);

  const overview = await mealRecordService.getLiveQRAttendance(hostelId, date);

  res.status(200).json({
    status: 'success',
    data: overview
  });
});

export const getDailyOverview = catchAsync(async (req, res) => {
  const { hostelId } = req.user;
  const { date } = dateQuerySchema.parse(req.query);
  const targetDate = date || new Date().toISOString().split('T')[0];

  const overview = await mealRecordService.getDailyOverview(hostelId, targetDate);

  res.status(200).json({
    status: 'success',
    data: overview
  });
});

export const getManagerLiveOverview = catchAsync(async (req, res) => {
  const { hostelId } = req.user;
  const { date } = dateQuerySchema.parse(req.query);
  const targetDate = date || new Date().toISOString().split('T')[0];

  const overview = await mealRecordService.getManagerLiveOverview(hostelId, targetDate);

  res.status(200).json({
    status: 'success',
    data: overview
  });
});

export const scanManagerQR = catchAsync(async (req, res) => {
  const { h: targetHostelId, s: scannedSecret, lat, lng } = scanManagerQRSchema.parse(req.body);
  const student = req.user;

  const result = await mealRecordService.processStudentScan(
    student, 
    targetHostelId, 
    scannedSecret, 
    lat, 
    lng
  );
  
  return res.status(200).json(result);
});

// ==========================================
// 4. CROSS-HOSTEL GUEST & MANAGER OVERRIDES
// ==========================================

export const requestGuestPermission = catchAsync(async (req, res) => {
  const { managerHostelId, reason } = requestGuestPermissionSchema.parse(req.body);
  const student = req.user;

  const result = mealRecordService.requestGuestPermission(student, managerHostelId, reason);

  res.status(200).json({
    status: 'success',
    message: result.message
  });
});

export const respondGuestPermission = catchAsync(async (req, res) => {
  const payload = respondGuestPermissionSchema.parse(req.body);
  const managerHostelId = req.user.hostelId;

  const result = await mealRecordService.respondGuestPermission(
    managerHostelId,
    req.user._id,
    payload
  );

  res.status(200).json(result);
});

export const scanStudentQR = catchAsync(async (req, res) => {
  const { studentRollNumber } = scanStudentQRSchema.parse(req.body);
  const managerHostelId = req.user.hostelId;

  const result = await mealRecordService.scanStudentQR(
    managerHostelId,
    req.user._id,
    studentRollNumber
  );

  return res.status(200).json(result);
});

// ==========================================
// 5. BIOMETRIC HARDWARE ATTENDANCE IMPORT
// ==========================================

export const uploadBiometricAttendance = catchAsync(async (req, res) => {
  const hostelId = req.body.hostelId || req.user.hostelId;

  if (req.user.role !== 'superadmin' && req.user.hostelId?.toString() !== hostelId.toString()) {
    const error = new Error('Access denied: You can only upload attendance for your own hostel.');
    error.statusCode = 403;
    throw error;
  }

  const result = await mealRecordService.processBiometricAttendance(hostelId, req.user, req.body);

  res.status(200).json({
    status: 'success',
    ...result
  });
});
