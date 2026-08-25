import { catchAsync } from '../../utils/catchAsync.js';
import { io } from '../../server.js';
import User from '../auth/auth.model.js';
import Hostel from '../hostel/hostel.model.js';

// 👇 Use the new Unified Models & Services
import MealRecord from './mealRecord.model.js';
import MealSchedule from '../meal/meal.model.js';
import mealService from '../meal/meal.service.js';
import mealRecordService from './mealRecord.service.js';
import { getAttendanceSchema, saveAttendanceSchema } from './mealRecord.validation.js';

// ==========================================
// 1. STUDENT FEATURE: PRE-SELECTION
// ==========================================
export const bulkSelectMeals = catchAsync(async (req, res, next) => {
  const student = req.user;
  
  const result = await mealRecordService.bulkSelectMeals(student, student.hostelId, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Meal selections saved successfully!',
    data: result
  });
});

export const getStudentSelections = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const student = req.user;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ status: 'error', message: 'startDate and endDate are required' });
  }

  const records = await mealRecordService.getStudentSelections(student.id, student.hostelId, startDate, endDate);

  res.status(200).json({
    status: 'success',
    data: records
  });
});

export const getStudentMonthlyRecords = catchAsync(async (req, res, next) => {
  const { month } = req.query; // YYYY-MM
  const student = req.user;
  
  if (!month) {
    return res.status(400).json({ status: 'error', message: 'month (YYYY-MM) is required' });
  }

  const records = await mealRecordService.getStudentMonthlyRecords(student.id, student.hostelId, month);

  res.status(200).json({
    status: 'success',
    data: records
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
  const targetDate = req.query.date;

  const currentMealData = await mealRecordService.calculateCurrentMeal(hostelId);
  const activeDate = targetDate || currentMealData.date;
  
  const schedule = await mealService.getScheduleByHostel(hostelId);
  const mealTypes = schedule ? schedule.mealNames : [];

  const attendances = await MealRecord.find({
    hostelId: hostelId,
    date: activeDate
  }).populate('studentId', 'name id').lean();

  const resultData = {};
  mealTypes.forEach(mt => {
    resultData[mt] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
  });

  attendances.forEach(att => {
    const mType = att.mealType;
    if (!resultData[mType]) {
      resultData[mType] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
    }
    
    const isAttended = att.attendance?.count > 0;
    const selCount = att.selection?.count || 0;
    
    resultData[mType].summary.totalSelections += selCount;
    if (isAttended) {
      resultData[mType].summary.totalAttendance += 1;
    }

    resultData[mType].data.push({
      name: att.studentId?.name || 'Unknown',
      rollNumber: att.studentId?.id || att.rollNumber,
      isGuest: att.isGuest,
      attendanceCount: att.attendance?.count || 0,
      selectionCount: selCount,
      hasAttended: isAttended,
      isSelected: selCount > 0
    });
  });

  res.status(200).json({
    status: 'success',
    data: {
      date: activeDate,
      currentMeal: currentMealData.mealType,
      mealTypes: mealTypes,
      data: resultData
    }
  });
});

export const getDailyOverview = catchAsync(async (req, res) => {
  const { hostelId } = req.user;
  const targetDate = req.query.date || new Date().toISOString().split('T')[0];

  const schedule = await mealService.getScheduleByHostel(hostelId);
  const mealTypes = schedule ? schedule.mealNames : [];

  if (!mealTypes.length) {
    return res.status(200).json({
      status: 'success',
      data: {
        date: targetDate,
        mealTypes: [],
        data: {}
      }
    });
  }

  const attendances = await MealRecord.find({
    hostelId: hostelId,
    date: targetDate
  }).populate('studentId', 'name id').lean();

  const resultData = {};
  mealTypes.forEach(mt => {
    resultData[mt] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
  });

  attendances.forEach(att => {
    const mType = att.mealType;
    if (!resultData[mType]) {
      resultData[mType] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
    }
    
    const isAttended = att.attendance?.count > 0;
    const selCount = att.selection?.count || 0;
    
    resultData[mType].summary.totalSelections += selCount;
    if (isAttended) {
      resultData[mType].summary.totalAttendance += 1;
    }

    resultData[mType].data.push({
      name: att.studentId?.name || 'Unknown',
      rollNumber: att.studentId?.id || att.rollNumber,
      isGuest: att.isGuest,
      attendanceCount: att.attendance?.count || 0,
      selectionCount: selCount,
      hasAttended: isAttended,
      isSelected: selCount > 0
    });
  });

  res.status(200).json({
    status: 'success',
    data: {
      date: targetDate,
      mealTypes: mealTypes,
      data: resultData
    }
  });
});

export const getManagerLiveOverview = catchAsync(async (req, res) => {
  const { hostelId } = req.user;
  const targetDate = req.query.date || new Date().toISOString().split('T')[0];

  const schedule = await mealService.getScheduleByHostel(hostelId);
  const mealTypes = schedule ? schedule.mealNames : [];

  if (!mealTypes.length) {
    return res.status(200).json({
      status: 'success',
      data: {
        date: targetDate,
        mealTypes: [],
        data: {}
      }
    });
  }

  // 1. Fetch ALL students for this hostel
  const allStudents = await User.find({ hostelId, role: 'student' }).select('name id').lean();

  // 2. Fetch MealRecords for this date
  const attendances = await MealRecord.find({
    hostelId: hostelId,
    date: targetDate
  }).populate('studentId', 'name id').lean();

  const resultData = {};
  mealTypes.forEach(mt => {
    resultData[mt] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
  });

  // Organize attendances by mealType and rollNumber for quick lookup
  const recordMap = {};
  attendances.forEach(att => {
    const roll = att.studentId?.id || att.rollNumber;
    if (!recordMap[att.mealType]) recordMap[att.mealType] = {};
    recordMap[att.mealType][roll] = att;
  });

  // 3. For each mealType, map over ALL students
  mealTypes.forEach(mType => {
    allStudents.forEach(student => {
      const att = recordMap[mType]?.[student.id];
      const isAttended = att?.attendance?.count > 0;
      const selCount = att?.selection?.count || 0;
      
      resultData[mType].summary.totalSelections += selCount;
      if (isAttended) {
        resultData[mType].summary.totalAttendance += 1;
      }

      if (selCount > 0 || isAttended) {
        resultData[mType].data.push({
          name: student.name,
          rollNumber: student.id,
          isGuest: false, // Students of this hostel are not guests
          attendanceCount: att?.attendance?.count || 0,
          selectionCount: selCount,
          hasAttended: isAttended,
          isSelected: selCount > 0
        });
      }
    });

    // Also include any guests who might not be in the allStudents list
    if (recordMap[mType]) {
      Object.values(recordMap[mType]).forEach(att => {
        if (att.isGuest) {
          const isAttended = att.attendance?.count > 0;
          const selCount = att.selection?.count || 0;
          
          resultData[mType].summary.totalSelections += selCount;
          if (isAttended) {
            resultData[mType].summary.totalAttendance += 1;
          }

          if (isAttended || selCount > 0) {
            resultData[mType].data.push({
              name: att.studentId?.name || 'Guest',
              rollNumber: att.studentId?.id || att.rollNumber,
              isGuest: true,
              attendanceCount: att.attendance?.count || 0,
              selectionCount: selCount,
              hasAttended: isAttended,
              isSelected: selCount > 0
            });
          }
        }
      });
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      date: targetDate,
      mealTypes: mealTypes,
      data: resultData
    }
  });
});


export const scanManagerQR = catchAsync(async (req, res) => {
  const { h: targetHostelId, s: scannedSecret, lat, lng } = req.body;
  const student = req.user;

  if (student.role !== 'student') {
    throw Object.assign(new Error('Only students can scan this QR code.'), { statusCode: 403 });
  }

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
  const { managerHostelId, reason } = req.body;
  const student = req.user;

  io.to(`hostel:${managerHostelId}`).emit('guest_permission_request', {
    requestId: `${student._id}_${Date.now()}`,
    rollNumber: student.id,
    name: student.name,
    studentId: student._id,
    sourceHostelId: student.hostelId,
    reason: reason || 'guest'
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

  const mealData = await mealRecordService.calculateCurrentMeal(managerHostelId);
  const isGuest = student.hostelId.toString() !== managerHostelId.toString();
  
  // Find existing record to preserve selection count if any
  const existingRecord = await MealRecord.findOne({
    hostelId: managerHostelId, date: mealData.date, mealType: mealData.mealType, rollNumber: student.id
  });

  const record = await MealRecord.findOneAndUpdate(
    { hostelId: managerHostelId, date: mealData.date, mealType: mealData.mealType, rollNumber: student.id },
    {
      $set: {
        hostelId: managerHostelId, date: mealData.date, mealType: mealData.mealType, mealInfo: mealData.mealInfo,
        rollNumber: student.id, studentId: student._id, isGuest,
        'attendance.hasEaten': true, 'attendance.method': 'Manual',
        'attendance.recordedBy': req.user._id
      },
      $setOnInsert: {
        'selection.hasSelected': existingRecord?.selection?.hasSelected || false,
        'selection.count': existingRecord?.selection?.count || 0
      },
      $inc: { 'attendance.count': 1 }
    },
    { upsert: true, new: true }
  );

  io.to(`hostel:${managerHostelId}`).emit('attendance_success', {
    rollNumber: student.id, name: student.name, isGuest,
    mealType: mealData.mealType, date: mealData.date, 
    count: record.attendance.count,
    selectionCount: record.selection.count
  });

  res.status(200).json({ status: 'success', message: 'Guest approved and attendance marked.', data: mealData });
});

// 👇 When a Manager scans a student's phone (Bypasses GPS because Manager is present)
export const scanStudentQR = catchAsync(async (req, res) => {
  const { studentRollNumber } = req.body;
  const managerHostelId = req.user.hostelId;

  const student = await User.findOne({ id: studentRollNumber, role: 'student' });
  if (!student) throw Object.assign(new Error('Student not found.'), { statusCode: 404 });

  // 1. Verify that a meal is actively being served right now
  const mealData = await mealRecordService.calculateCurrentMeal(managerHostelId);

  if (student.hostelId.toString() === managerHostelId.toString()) {
    // Same hostel, force upsert
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

    io.to(`hostel:${managerHostelId}`).emit('attendance_success', {
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

// ==========================================
// 5. BIOMETRIC HARDWARE ATTENDANCE IMPORT
// ==========================================
export const uploadBiometricAttendance = catchAsync(async (req, res) => {
  const hostelId = req.body.hostelId || req.user.hostelId;

  if (req.user.role !== 'superadmin' && req.user.hostelId.toString() !== hostelId.toString()) {
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
