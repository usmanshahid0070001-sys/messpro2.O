import { catchAsync } from '../../utils/catchAsync.js';
import { io } from '../../server.js';
import User from '../auth/auth.model.js';
import Hostel from '../hostel/hostel.model.js';

// 👇 Use the new Unified Models & Services
import MealRecord from '../meal/mealRecord.model.js';
import mealRecordService from './mealRecord.service.js';
import { getAttendanceSchema, saveAttendanceSchema } from './attendance.validation.js';

// ==========================================
// 1. STUDENT FEATURE: PRE-SELECTION
// ==========================================
export const selectMeal = catchAsync(async (req, res, next) => {
  const student = req.user;
  
  // Service handles Zod validation + Admin Max Limit checks
  const updatedDoc = await mealRecordService.selectMeal(student, student.hostelId, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Meal selection saved successfully!',
    data: updatedDoc
  });
});


// ==========================================
// 2. MANAGER FEATURES: FETCH & BULK SAVE
// ==========================================
export const getAttendance = catchAsync(async (req, res, next) => {
  const { hostelId, date, mealType } = getAttendanceSchema.parse(req.query);

  if (req.user.role !== 'superadmin' && req.user.hostelId.toString() !== hostelId.toString()) {
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

export const saveAttendance = catchAsync(async (req, res, next) => {
  const { hostelId, date, mealType, mealInfo, records } = saveAttendanceSchema.parse(req.body);

  if (req.user.role !== 'superadmin' && req.user.hostelId.toString() !== hostelId.toString()) {
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
// 3. QR ATTENDANCE LOGIC (THE FORTRESS)
// ==========================================

export const getManagerQR = catchAsync(async (req, res) => {
  // Instead of a JWT, we fetch the Static Secure Pointer from the Hostel
  const hostel = await Hostel.findById(req.user.hostelId);
  
  res.status(200).json({
    status: 'success',
    data: {
      h: hostel._id,
      s: hostel.qrSecret // The 8-character unguessable string
    }
  });
});

export const getLiveQRAttendance = catchAsync(async (req, res) => {
  const { hostelId } = req.user;
  const mealData = await mealRecordService.calculateCurrentMeal(hostelId);
  
  const attendances = await MealRecord.find({
    hostelId: hostelId,
    date: mealData.date,
    mealType: mealData.mealType,
    'attendance.hasEaten': true // Only get those who actually showed up
  }).populate('studentId', 'name id');

  const formatted = attendances.map(att => ({
    name: att.studentId?.name || 'Unknown',
    rollNumber: att.studentId?.id || att.rollNumber,
    isGuest: att.isGuest,
    count: att.attendance.count // Use the new nested count
  }));

  res.status(200).json({
    status: 'success',
    data: formatted
  });
});


// 👇 THE BOUNCER: When a student scans the printed wall QR code
export const scanManagerQR = catchAsync(async (req, res) => {
  // Extract the Secure Pointer and GPS coordinates from the student's phone
  const { h: targetHostelId, s: scannedSecret, lat, lng } = req.body;
  const student = req.user;

  if (student.role !== 'student') {
    throw Object.assign(new Error('Only students can scan this QR code.'), { statusCode: 403 });
  }

  // Same Hostel: Run through the strict GPS Geofence + Count limit logic
  if (student.hostelId.toString() === targetHostelId.toString()) {
    const result = await mealRecordService.processStudentScan(
      student, 
      targetHostelId, 
      scannedSecret, 
      lat, 
      lng
    );
    
    return res.status(200).json(result);
  } else {
    // Cross-Hostel Guest: Pause and ask for permission
    return res.status(200).json({
      status: 'requires_permission',
      managerHostelId: targetHostelId,
      message: 'You are not registered in this hostel. Do you want to request guest permission?'
    });
  }
});


// ==========================================
// 4. CROSS-HOSTEL GUEST & MANAGER OVERRIDES
// ==========================================

export const requestGuestPermission = catchAsync(async (req, res) => {
  const { managerHostelId } = req.body;
  const student = req.user;

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

  // Because the Manager approved this, we bypass GPS checks and force an upsert
  const mealData = await mealRecordService.calculateCurrentMeal(managerHostelId);
  
  const record = await MealRecord.findOneAndUpdate(
    { hostelId: managerHostelId, date: mealData.date, mealType: mealData.mealType, rollNumber: student.id },
    {
      $set: {
        hostelId: managerHostelId, date: mealData.date, mealType: mealData.mealType, mealInfo: mealData.mealInfo,
        rollNumber: student.id, studentId: student._id, isGuest: true,
        'attendance.hasEaten': true, 'attendance.method': 'Manual',
        'attendance.recordedBy': req.user._id
      },
      $inc: { 'attendance.count': 1 }
    },
    { upsert: true, new: true }
  );

  io.to(managerHostelId.toString()).emit('attendance_success', {
    rollNumber: student.id, name: student.name, isGuest: true,
    mealType: mealData.mealType, date: mealData.date, count: record.attendance.count
  });

  res.status(200).json({ status: 'success', message: 'Guest approved and attendance marked.', data: mealData });
});

// 👇 When a Manager scans a student's phone (Bypasses GPS because Manager is present)
export const scanStudentQR = catchAsync(async (req, res) => {
  const { studentRollNumber } = req.body;
  const managerHostelId = req.user.hostelId;

  const student = await User.findOne({ id: studentRollNumber, role: 'student' });
  if (!student) throw Object.assign(new Error('Student not found.'), { statusCode: 404 });

  if (student.hostelId.toString() === managerHostelId.toString()) {
    // Same hostel, force upsert
    const mealData = await mealRecordService.calculateCurrentMeal(managerHostelId);
    const record = await MealRecord.findOneAndUpdate(
      { hostelId: managerHostelId, date: mealData.date, mealType: mealData.mealType, rollNumber: student.id },
      {
        $set: {
          hostelId: managerHostelId, date: mealData.date, mealType: mealData.mealType, mealInfo: mealData.mealInfo,
          rollNumber: student.id, studentId: student._id, isGuest: false,
          'attendance.hasEaten': true, 'attendance.method': 'QR', 'attendance.recordedBy': req.user._id
        },
        $inc: { 'attendance.count': 1 }
      },
      { upsert: true, new: true }
    );

    io.to(managerHostelId.toString()).emit('attendance_success', {
      rollNumber: student.id, name: student.name, isGuest: false,
      mealType: mealData.mealType, date: mealData.date, count: record.attendance.count
    });

    return res.status(200).json({ status: 'success', message: 'Attendance marked successfully.', data: mealData });
  } else {
    // Different hostel, UI should prompt manager
    return res.status(200).json({
      status: 'requires_permission',
      student: { _id: student._id, name: student.name, rollNumber: student.id, hostelId: student.hostelId },
      message: 'This student is from a different hostel. Accept as guest?'
    });
  }
});