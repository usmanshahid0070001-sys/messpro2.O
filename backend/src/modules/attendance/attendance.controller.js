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
