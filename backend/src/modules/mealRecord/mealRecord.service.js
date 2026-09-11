import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { io } from '../../server.js';
import mealService from '../meal/meal.service.js';
import hostelService from '../hostel/hostel.service.js';
import mealRecordRepository from './mealRecord.repository.js';
import { bulkSelectMealsSchema, processBiometricAttendanceSchema } from './mealRecord.validation.js';

// ==========================================
// HELPER: Time conversion to minutes
// ==========================================

// Helper to convert any time format ("07:30 AM", "07:30", "19:30", "7:30pm") into minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  if (typeof timeStr === 'object' && timeStr.end) {
    return parseTimeToMinutes(timeStr.end);
  }
  const str = String(timeStr).trim();
  const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : null;

  if (modifier === 'AM' && hours === 12) hours = 0;
  if (modifier === 'PM' && hours < 12) hours += 12;

  return hours * 60 + minutes;
}

// Helper to safely obtain a valid IANA timezone name without throwing RangeError
function getSafeTimezone(tz) {
  if (!tz || typeof tz !== 'string') return 'Asia/Karachi';
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return 'Asia/Karachi';
  }
}

// In-memory cooldown map for guest / walk-in permission socket requests
const permissionCooldownMap = new Map();
// In-memory map to prevent duplicate acceptance/rejection of the same request
const resolvedRequestsMap = new Map();

class MealRecordService {
  // ==========================================
  // 1. STUDENT FEATURE: SELECT MEAL IN ADVANCE
  // ==========================================
  async bulkSelectMeals(student, hostelId, payload) {
    if (student.status === 'Suspended') {
      const error = new Error('Your account is currently suspended. You cannot select or modify meals while suspended.');
      error.statusCode = 403;
      throw error;
    }

    const { selections } = bulkSelectMealsSchema.parse(payload);
    
    const schedule = await mealService.getScheduleByHostel(hostelId);
    if (!schedule) {
      const error = new Error('Meal schedule not found for this hostel.');
      error.statusCode = 404;
      throw error;
    }

    if (schedule.status !== 'active') {
      const error = new Error('Meal selection is currently inactive. You can only view the menu.');
      error.statusCode = 403;
      throw error;
    }
    const hostel = await hostelService.getHostelById(hostelId);
    const timezone = getSafeTimezone(hostel?.location);
    const now = new Date();

    const localTodayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(now);

    const localTimeParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false
    }).format(now).split(':');
    const currentMinutes = parseInt(localTimeParts[0], 10) * 60 + parseInt(localTimeParts[1], 10);

    const mealNames = schedule.mealNames || [];
    const selectionTimings = schedule.selectionTiming || [];

    const maxAllowed = schedule.maxMealSelection || 1;
    const bulkOps = [];
    
    // Fetch existing records for checking attendance before zeroing out selection
    const existingRecords = await mealRecordRepository.findExistingRecords(
      hostelId,
      student.id,
      selections.map(s => s.date)
    );
    const recordMap = new Map();
    existingRecords.forEach(r => recordMap.set(`${r.date}_${r.mealType}`, r));

    for (const selection of selections) {
      // 1. Skip past dates without aborting future days
      if (selection.date < localTodayStr) {
        continue;
      }

      // 2. Check today's meal selection deadlines
      if (selection.date === localTodayStr) {
        const slotIdx = mealNames.indexOf(selection.mealType);
        if (slotIdx !== -1 && selectionTimings[slotIdx]) {
          const timingWindow = selectionTimings[slotIdx];
          const endMin = timingWindow.end
            ? parseTimeToMinutes(timingWindow.end)
            : (typeof timingWindow === 'string' ? parseTimeToMinutes(timingWindow) : null);

          if (endMin !== null && currentMinutes > endMin) {
            // Deadline for this meal today has passed; skip updating this slot and proceed with other meals
            continue;
          }
        }
      }

      const count = Math.max(0, Math.min(maxAllowed, Number(selection.count) || 0));

      if (count === 0) {
        const existing = recordMap.get(`${selection.date}_${selection.mealType}`);
        const attCount = existing?.attendance?.count || 0;

        if (attCount === 0) {
          // Both selection and attendance are 0, completely delete the document
          bulkOps.push({
            deleteOne: {
              filter: {
                hostelId,
                date: selection.date,
                mealType: selection.mealType,
                rollNumber: student.id
              }
            }
          });
        } else {
          // Keep document for attendance history, but remove selection
          bulkOps.push({
            updateOne: {
              filter: {
                hostelId,
                date: selection.date,
                mealType: selection.mealType,
                rollNumber: student.id
              },
              update: {
                $set: {
                  'selection.hasSelected': false,
                  'selection.count': 0
                }
              }
            }
          });
        }
      } else {
        bulkOps.push({
          updateOne: {
            filter: {
              hostelId,
              date: selection.date,
              mealType: selection.mealType,
              rollNumber: student.id
            },
            update: {
              $set: {
                hostelId,
                studentId: student._id,
                rollNumber: student.id,
                date: selection.date,
                mealType: selection.mealType,
                mealInfo: selection.mealInfo,
                isGuest: false,
                'selection.hasSelected': true,
                'selection.count': count
              },
              $setOnInsert: {
                'attendance.hasEaten': false,
                'attendance.count': 0,
                'attendance.method': 'QR'
              }
            },
            upsert: true
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      await mealRecordRepository.bulkWriteRecords(bulkOps);
    }
    
    return { count: bulkOps.length };
  }

  async getStudentSelections(rollNumber, hostelId, startDate, endDate) {
    return mealRecordRepository.getStudentSelections(rollNumber, hostelId, startDate, endDate);
  }

  async getStudentMonthlyRecords(rollNumber, hostelId, month) {
    // month is expected to be 'YYYY-MM'
    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // Simple string matching, handles up to 31st

    return mealRecordRepository.getStudentMonthlyRecords({
      rollNumber,
      hostelId,
      date: { $gte: startDate, $lte: endDate }
    });
  }

  // ==========================================
  // 2. MANAGER FEATURE: FETCH & BULK UPSERT
  // ==========================================

  async getAttendance(hostelId, date, mealType) {
    return mealRecordRepository.getPopulatedAttendance({ hostelId, date, mealType });
  }

  async upsertAttendance(hostelId, date, mealType, mealInfo, records, recordedBy) {
    // 1. Deduplicate incoming records (last one wins)
    const uniqueRecordsMap = new Map();
    records.forEach(r => {
      if (r && r.rollNumber !== undefined && r.rollNumber !== null) {
        uniqueRecordsMap.set(String(r.rollNumber).trim(), r);
      }
    });
    const uniqueRecords = Array.from(uniqueRecordsMap.values());
    const rollNumbers = uniqueRecords.map(r => String(r.rollNumber).trim());
    const lowerRolls = rollNumbers.map(r => r.toLowerCase());

    // Fetch existing records to check their selection counts and preserve existing studentIds
    const existingRecords = await mealRecordRepository.findAttendanceRecordsForUpsert(
      hostelId,
      date,
      mealType,
      rollNumbers,
      lowerRolls
    );
    const recordMap = new Map();
    existingRecords.forEach(r => {
      if (r.rollNumber) {
        recordMap.set(r.rollNumber, r);
        recordMap.set(r.rollNumber.toLowerCase(), r);
      }
    });

    // 2. Global User Lookup (case-insensitive and by ObjectId if applicable)
    const objectIdRolls = rollNumbers.filter(r => mongoose.isValidObjectId(r));
    const existingUsers = await mealRecordRepository.findUsersByRollsOrIds(
      rollNumbers,
      lowerRolls,
      objectIdRolls
    );

    const userMap = new Map();
    existingUsers.forEach(u => {
      if (u.id) {
        userMap.set(u.id, u);
        userMap.set(u.id.toLowerCase(), u);
      }
      userMap.set(u._id.toString(), u);
    });

    const bulkOps = [];

    // 3. Map the UI's exact counts to the Database
    uniqueRecords.forEach(record => {
      // This 'count' is the exact number from the Manager's +/- UI buttons
      const { rollNumber, count: uiCount } = record;
      const cleanRoll = String(rollNumber).trim();
      const existingRecord = recordMap.get(cleanRoll) || recordMap.get(cleanRoll.toLowerCase());

      const user = userMap.get(cleanRoll) || userMap.get(cleanRoll.toLowerCase());
      const studentId = user ? user._id : (existingRecord?.studentId || null);
      const isGuest = user
        ? (user.hostelId.toString() !== hostelId.toString())
        : (existingRecord?.isGuest ?? true);

      const targetRollNumber = existingRecord?.rollNumber || (user?.id ? user.id : cleanRoll);

      if (uiCount === 0) {
        // Manager clicked '-' until it reached 0. 
        const selCount = existingRecord?.selection?.count || 0;

        if (selCount === 0) {
          // Both selection and attendance are 0, completely delete the document
          bulkOps.push({
            deleteOne: {
              filter: { hostelId, date, mealType, rollNumber: targetRollNumber }
            }
          });
        } else {
          // We reset the attendance side but keep their pre-selection alive!
          bulkOps.push({
            updateOne: {
              filter: { hostelId, date, mealType, rollNumber: targetRollNumber },
              update: {
                $set: {
                  'attendance.hasEaten': false,
                  'attendance.count': 0, // Set exactly to 0
                  'attendance.recordedBy': recordedBy,
                  'attendance.method': 'Manual'
                }
              }
            }
          });
        }
      } else {
        // Manager clicked '+' or 'Mark Pre-Reserved' and hit save. We overwrite the count!
        bulkOps.push({
          updateOne: {
            filter: { hostelId, date, mealType, rollNumber: targetRollNumber },
            update: {
              $set: {
                hostelId,
                date,
                mealType,
                mealInfo,
                rollNumber: targetRollNumber,
                isGuest,
                studentId,
                'attendance.hasEaten': true,
                'attendance.count': uiCount, // Overwrite with the exact UI number
                'attendance.recordedBy': recordedBy,
                'attendance.method': 'Manual'
              }
            },
            upsert: true
          }
        });
      }
    });

    if (bulkOps.length > 0) {
      await mealRecordRepository.bulkWriteRecords(bulkOps);
    }
  }

  // ==========================================
  // 3. STUDENT SCAN FEATURE (UNBREAKABLE QR LOGIC)
  // ==========================================
  async processStudentScan(student, hostelId, scannedSecret) {
    if (student.status === 'Suspended') {
      const error = new Error('Your account is currently suspended. You cannot scan for meals while suspended.');
      error.statusCode = 403;
      throw error;
    }

    const hostel = await hostelService.getHostelById(hostelId);
    if (!hostel) throw new Error('Hostel not found.');

    // 🛡️ Optional Secret validation if both configured and scanned
    if (scannedSecret && hostel.qrSecret && hostel.qrSecret !== scannedSecret) {
      const error = new Error('Invalid or expired QR Code.');
      error.statusCode = 401;
      throw error;
    }

    // 🛡️ Time Validation (Determine current active meal window)
    const mealData = await this.calculateCurrentMeal(hostelId);

    const isGuest = student.hostelId.toString() !== hostelId.toString();
    const autoVerification = Boolean(hostel.settings?.autoMealVerification);

    // 🛡️ GUEST LOGIC: Different Hostel -> Always Request Manager Permission via Socket
    if (isGuest) {
      return {
        status: 'requires_permission',
        reason: 'guest',
        managerHostelId: hostelId,
        message: 'You are registered in a different hostel. Please request dining permission from the manager or admin.'
      };
    }

    // 🛡️ FIND TODAY'S RECORD FOR REGISTERED STUDENT
    let record = await mealRecordRepository.findSingleRecord({
      hostelId,
      date: mealData.date,
      mealType: mealData.mealType,
      rollNumber: student.id
    });

    if (!record) {
      // 🛡️ WALK-IN SCENARIO (No Pre-Selection for Today)
      if (!autoVerification) {
        return {
          status: 'requires_permission',
          reason: 'unselected',
          managerHostelId: hostelId,
          message: 'You did not pre-reserve this meal. Please request dining permission from the manager or admin.'
        };
      }

      // Auto-verification is ON -> mark walk-in attendance immediately
      record = await mealRecordRepository.createRecord({
        hostelId,
        date: mealData.date,
        mealType: mealData.mealType,
        mealInfo: mealData.mealInfo,
        rollNumber: student.id,
        studentId: student._id,
        isGuest: false,
        'selection.hasSelected': false,
        'selection.count': 0,
        'attendance.hasEaten': true,
        'attendance.method': 'QR',
        'attendance.count': 1
      });
    } else {
      const isUnselected = !record.selection?.hasSelected || (record.selection?.count || 0) === 0;
      const isLimitReached = (record.attendance?.count || 0) >= (record.selection?.count || 0);

      if (isUnselected) {
        if (!autoVerification) {
          return {
            status: 'requires_permission',
            reason: 'unselected',
            managerHostelId: hostelId,
            message: 'You did not pre-reserve this meal. Please request dining permission from the manager or admin.'
          };
        }
      } else if (isLimitReached) {
        // EXTRA MEAL (Attendance >= Selection)
        if (!autoVerification) {
          return {
            status: 'requires_permission',
            reason: 'extra_meal',
            managerHostelId: hostelId,
            message: `You have already claimed your reserved portion (${record.selection.count}). Please request manager approval for an extra portion.`
          };
        }
      }

      // Atomically update existing record to prevent concurrency race conditions
      const updatedRecord = await mealRecordRepository.findOneAndUpdate(
        { _id: record._id },
        {
          $set: {
            'attendance.hasEaten': true,
            'attendance.method': 'QR'
          },
          $inc: { 'attendance.count': 1 }
        },
        { new: true }
      );
      if (updatedRecord) {
        record = updatedRecord;
      }
    }

    // Emit live socket event to Manager's Dashboard
    io.to(`hostel:${hostelId}`).emit('attendance_success', {
      rollNumber: student.id,
      name: student.name,
      isGuest,
      mealType: mealData.mealType,
      date: mealData.date,
      count: record.attendance.count
    });

    const recordPayload = {
      mealType: mealData.mealType,
      meal: mealData.mealInfo?.name || 'Regular Meal',
      mealInfo: mealData.mealInfo,
      date: mealData.date,
      count: record.attendance.count,
      attendance: {
        hasEaten: true,
        count: record.attendance.count,
        method: 'QR'
      }
    };

    return {
      status: 'success',
      success: true,
      message: 'Attendance marked successfully.',
      record: recordPayload,
      data: {
        meal: mealData.mealInfo.name,
        mealType: mealData.mealType,
        price: mealData.mealInfo.price,
        count: record.attendance.count,
        date: mealData.date
      }
    };
  }

  // ==========================================
  // 4. MANAGER QR & LIVE DASHBOARDS
  // ==========================================

  async getManagerQR(hostelId) {
    const hostel = await mealRecordRepository.findHostelById(hostelId);
    if (!hostel) {
      const error = new Error('Hostel not found.');
      error.statusCode = 404;
      throw error;
    }
    return {
      hostelId: hostel._id.toString(),
      h: hostel._id.toString(),
      s: hostel.qrSecret || undefined
    };
  }

  generateManagerQRToken(hostelId) {
    const payload = { type: 'manager_qr', hostelId: hostelId.toString() };
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' });
    return { token, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) };
  }

  async calculateCurrentMeal(hostelId) {
    const hostel = await hostelService.getHostelById(hostelId);
    if (!hostel) throw new Error('Hostel not found');

    const schedule = await mealService.getScheduleByHostel(hostelId);
    if (!schedule || !schedule.mealNames || schedule.mealNames.length === 0) {
      throw new Error('Meal schedule not configured for this hostel');
    }

    const timezone = getSafeTimezone(hostel.location);
    const now = new Date();

    const localDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(now);

    const localDayName = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, weekday: 'long'
    }).format(now);

    const localTimeParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false
    }).format(now).split(':');

    const currentMinutes = parseInt(localTimeParts[0], 10) * 60 + parseInt(localTimeParts[1], 10);

    const mealNames = schedule.mealNames || [];
    const servingTimes = schedule.servingTiming || [];

    let selectedMealIndex = -1;

    // 1. Match against configured serving timing windows [start, end]
    for (let i = 0; i < mealNames.length; i++) {
      const window = servingTimes[i];
      if (window && (window.start || window.end)) {
        const startMin = window.start ? parseTimeToMinutes(window.start) : 0;
        const endMin = window.end ? parseTimeToMinutes(window.end) : 1439;
        if (currentMinutes >= (startMin ?? 0) && currentMinutes <= (endMin ?? 1439)) {
          selectedMealIndex = i;
          break;
        }
      }
    }

    // 2. If serving timing was not configured for some or all slots, evaluate sensible default serving windows:
    const hasConfiguredTimes = servingTimes.some((w) => w && (w.start || w.end));
    if (selectedMealIndex === -1 && !hasConfiguredTimes) {
      if (mealNames.length === 2) {
        // 2 slots: Lunch (11:30 - 15:30) & Dinner (18:30 - 22:30)
        if (currentMinutes >= 690 && currentMinutes <= 930) selectedMealIndex = 0;
        else if (currentMinutes >= 1110 && currentMinutes <= 1350) selectedMealIndex = 1;
      } else {
        // 3 slots: Breakfast (06:30 - 10:30), Lunch (11:30 - 15:30), Dinner (18:30 - 22:30)
        if (currentMinutes >= 390 && currentMinutes <= 630) selectedMealIndex = 0;
        else if (currentMinutes >= 690 && currentMinutes <= 930) selectedMealIndex = 1;
        else if (currentMinutes >= 1110 && currentMinutes <= 1350) selectedMealIndex = Math.min(2, mealNames.length - 1);
      }
    }

    // 🛡️ REJECT: If scan occurs outside any active dining hall serving window
    if (selectedMealIndex === -1) {
      const scheduleSummary = mealNames
        .map((name, idx) => {
          const time = servingTimes[idx];
          return time && time.start && time.end ? `${name} (${time.start} - ${time.end})` : name;
        })
        .join(', ');

      const error = new Error(
        `No meal is currently being served at this time (${localTimeParts.join(':')}). Scheduled serving hours: ${scheduleSummary || 'Check Mess Schedule'}. Please scan during active dining hours.`
      );
      error.statusCode = 400;
      throw error;
    }

    const mealType = mealNames[selectedMealIndex] || 'Meal';
    const todaysMenu = schedule.menu?.[localDayName] || [];
    const menuItem = todaysMenu[selectedMealIndex];

    const mealInfo = {
      name: menuItem?.meal && menuItem.meal !== 'none' ? menuItem.meal : 'Regular Meal',
      price: menuItem?.price || 0
    };

    return { 
      date: localDateStr, 
      mealType, 
      mealInfo,
      maxMealSelection: schedule.maxMealSelection || 1,
      servingTime: servingTimes[selectedMealIndex] || null
    };
  }

  async getLiveQRAttendance(hostelId, targetDate) {
    const currentMealData = await this.calculateCurrentMeal(hostelId);
    const activeDate = targetDate || currentMealData.date;
    
    const schedule = await mealService.getScheduleByHostel(hostelId);
    const mealTypes = schedule ? schedule.mealNames : [];

    const attendances = await mealRecordRepository.findDailyRecords(hostelId, activeDate);

    // Resolve any records with missing populated studentId
    const missingRolls = attendances
      .filter(a => !a.studentId?.name && a.rollNumber)
      .map(a => a.rollNumber.toLowerCase());

    const fallbackUserMap = new Map();
    if (missingRolls.length > 0) {
      const foundUsers = await mealRecordRepository.findUsersByIdsList(missingRolls);
      foundUsers.forEach(u => {
        if (u.id) fallbackUserMap.set(u.id.toLowerCase(), u);
      });
    }

    const resultData = {};
    mealTypes.forEach(mt => {
      resultData[mt] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
    });

    attendances.forEach(att => {
      const mType = att.mealType;
      if (!resultData[mType]) {
        resultData[mType] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
      }
      
      const attCount = att.attendance?.count || 0;
      const selCount = att.selection?.count || 0;
      
      resultData[mType].summary.totalSelections += selCount;
      resultData[mType].summary.totalAttendance += attCount;

      const matchedUser = att.studentId || (att.rollNumber ? fallbackUserMap.get(att.rollNumber.toLowerCase()) : null);
      const resolvedName = matchedUser?.name || (att.isGuest ? 'Guest Entry' : (att.rollNumber || 'Resident'));
      const resolvedRoll = matchedUser?.id || att.rollNumber;

      resultData[mType].data.push({
        name: resolvedName,
        rollNumber: resolvedRoll,
        isGuest: att.isGuest,
        attendanceCount: attCount,
        selectionCount: selCount,
        hasAttended: attCount > 0,
        isSelected: selCount > 0
      });
    });

    return {
      date: activeDate,
      currentMeal: currentMealData.mealType,
      mealTypes,
      data: resultData
    };
  }

  async getDailyOverview(hostelId, targetDate) {
    const schedule = await mealService.getScheduleByHostel(hostelId);
    const mealTypes = schedule ? schedule.mealNames : [];

    if (!mealTypes.length) {
      return {
        date: targetDate,
        mealTypes: [],
        data: {}
      };
    }

    const attendances = await mealRecordRepository.findDailyRecords(hostelId, targetDate);

    // Resolve any records with missing populated studentId
    const missingRolls = attendances
      .filter(a => !a.studentId?.name && a.rollNumber)
      .map(a => a.rollNumber.toLowerCase());

    const fallbackUserMap = new Map();
    if (missingRolls.length > 0) {
      const foundUsers = await mealRecordRepository.findUsersByIdsList(missingRolls);
      foundUsers.forEach(u => {
        if (u.id) fallbackUserMap.set(u.id.toLowerCase(), u);
      });
    }

    const resultData = {};
    mealTypes.forEach(mt => {
      resultData[mt] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
    });

    attendances.forEach(att => {
      const mType = att.mealType;
      if (!resultData[mType]) {
        resultData[mType] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
      }
      
      const attCount = att.attendance?.count || 0;
      const selCount = att.selection?.count || 0;

      resultData[mType].summary.totalSelections += selCount;
      resultData[mType].summary.totalAttendance += attCount;

      const matchedUser = att.studentId || (att.rollNumber ? fallbackUserMap.get(att.rollNumber.toLowerCase()) : null);
      const resolvedName = matchedUser?.name || (att.isGuest ? 'Guest Entry' : (att.rollNumber || 'Resident'));
      const resolvedRoll = matchedUser?.id || att.rollNumber;

      resultData[mType].data.push({
        name: resolvedName,
        rollNumber: resolvedRoll,
        isGuest: att.isGuest,
        attendanceCount: attCount,
        selectionCount: selCount,
        hasAttended: attCount > 0,
        isSelected: selCount > 0
      });
    });

    return {
      date: targetDate,
      mealTypes,
      data: resultData
    };
  }

  async getManagerLiveOverview(hostelId, targetDate) {
    const schedule = await mealService.getScheduleByHostel(hostelId);
    const mealTypes = schedule ? schedule.mealNames : [];

    if (!mealTypes.length) {
      return {
        date: targetDate,
        mealTypes: [],
        data: {}
      };
    }

    // 1. Fetch ALL students for this hostel
    const allStudents = await mealRecordRepository.findStudentsByHostel(hostelId);

    // 2. Fetch MealRecords for this date
    const attendances = await mealRecordRepository.findDailyRecords(hostelId, targetDate);

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
        const attCount = att?.attendance?.count || 0;
        const selCount = att?.selection?.count || 0;

        resultData[mType].summary.totalSelections += selCount;
        resultData[mType].summary.totalAttendance += attCount;

        if (selCount > 0 || isAttended) {
          resultData[mType].data.push({
            name: student.name,
            rollNumber: student.id,
            isGuest: false,
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
            const guestAttCount = att.attendance?.count || 0;
            const selCount = att.selection?.count || 0;

            resultData[mType].summary.totalSelections += selCount;
            resultData[mType].summary.totalAttendance += guestAttCount;

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

    return {
      date: targetDate,
      mealTypes,
      data: resultData
    };
  }

  // ==========================================
  // 5. GUEST PERMISSION & STUDENT QR BY MANAGER
  // ==========================================

  requestGuestPermission(student, managerHostelId, reason) {
    const studentKey = `${student._id}_${managerHostelId}_${reason || 'guest'}`;
    const now = Date.now();
    const lastRequestTime = permissionCooldownMap.get(studentKey);

    // Cooldown: prevent socket flooding if duplicate request within 10 seconds
    if (lastRequestTime && (now - lastRequestTime) < 10000) {
      return { 
        message: 'Permission request already sent. Please wait for the manager to respond.',
        requestId: null 
      };
    }

    permissionCooldownMap.set(studentKey, now);
    setTimeout(() => permissionCooldownMap.delete(studentKey), 35000);

    const requestId = `req_${student._id}_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = now + 30000; // 30s timeout

    const payload = {
      requestId,
      rollNumber: student.id,
      name: student.name,
      studentId: student._id.toString(),
      sourceHostelId: student.hostelId?.toString(),
      targetHostelId: managerHostelId.toString(),
      reason: reason || 'guest',
      createdAt: now,
      expiresAt
    };

    // Broadcast live permission card to all online managers and admins of this hostel
    io.to(`hostel:${managerHostelId}`).emit('guest_permission_request', payload);

    return { 
      message: 'Permission request sent to manager and admins.',
      requestId,
      data: payload
    };
  }

  async respondGuestPermission(managerHostelId, recordedById, { requestId, studentId, isApproved }) {
    // 🛡️ ANTI-DUPLICATE GUARD: Prevent the same request from ever being accepted or declined twice
    if (requestId) {
      const existingResolution = resolvedRequestsMap.get(requestId);
      if (existingResolution) {
        const error = new Error(`This request has already been ${existingResolution.status}.`);
        error.statusCode = 409;
        throw error;
      }

      resolvedRequestsMap.set(requestId, {
        status: isApproved ? 'accepted' : 'declined',
        resolvedBy: recordedById,
        timestamp: Date.now()
      });
      // Retain resolved memory for 10 minutes then free memory
      setTimeout(() => resolvedRequestsMap.delete(requestId), 600000);
    }

    if (!isApproved) {
      // Notify student in their personal socket room
      io.to(`user:${studentId}`).emit('permission_response', {
        requestId,
        studentId,
        isApproved: false,
        message: 'Your dining request was declined by the manager/admin.'
      });

      // Sync with all manager windows in this hostel
      io.to(`hostel:${managerHostelId}`).emit('guest_permission_updated', {
        requestId,
        studentId,
        isApproved: false,
        status: 'declined',
        resolvedBy: recordedById
      });

      return { status: 'success', message: 'Request declined.' };
    }

    const student = await mealRecordRepository.findUserById(studentId);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }

    const mealData = await this.calculateCurrentMeal(managerHostelId);
    const isGuest = student.hostelId.toString() !== managerHostelId.toString();
    
    // Find existing record to preserve selection count if any
    const existingRecord = await mealRecordRepository.findSingleRecord({
      hostelId: managerHostelId,
      date: mealData.date,
      mealType: mealData.mealType,
      rollNumber: student.id
    });

    const record = await mealRecordRepository.findOneAndUpdate(
      { hostelId: managerHostelId, date: mealData.date, mealType: mealData.mealType, rollNumber: student.id },
      {
        $set: {
          hostelId: managerHostelId,
          date: mealData.date,
          mealType: mealData.mealType,
          mealInfo: mealData.mealInfo,
          rollNumber: student.id,
          studentId: student._id,
          isGuest,
          'attendance.hasEaten': true,
          'attendance.method': 'Manual',
          'attendance.recordedBy': recordedById
        },
        $setOnInsert: {
          'selection.hasSelected': existingRecord?.selection?.hasSelected || false,
          'selection.count': existingRecord?.selection?.count || 0
        },
        $inc: { 'attendance.count': 1 }
      },
      { upsert: true, new: true }
    );

    // 1. Emit live attendance update to manager dashboard
    io.to(`hostel:${managerHostelId}`).emit('attendance_success', {
      rollNumber: student.id,
      name: student.name,
      isGuest,
      mealType: mealData.mealType,
      date: mealData.date, 
      count: record.attendance.count,
      selectionCount: record.selection?.count || 0
    });

    // 2. Notify student in their personal socket room with full record payload
    io.to(`user:${studentId}`).emit('permission_response', {
      requestId,
      studentId,
      isApproved: true,
      message: 'Attendance approved and marked successfully!',
      record: {
        mealType: mealData.mealType,
        meal: mealData.mealInfo?.name || 'Regular Meal',
        count: record.attendance.count,
        date: mealData.date,
        attendance: {
          hasEaten: true,
          count: record.attendance.count,
          method: 'Manual'
        }
      }
    });

    // 3. Sync with all manager terminals in this hostel
    io.to(`hostel:${managerHostelId}`).emit('guest_permission_updated', {
      requestId,
      studentId,
      isApproved: true,
      status: 'accepted',
      resolvedBy: recordedById
    });

    return {
      status: 'success',
      message: 'Guest approved and attendance marked.',
      data: mealData,
      record
    };
  }

  async scanStudentQR(managerHostelId, recordedById, studentRollNumber) {
    const student = await mealRecordRepository.findStudentByRollNumber(studentRollNumber);
    if (!student) {
      const error = new Error('Student not found.');
      error.statusCode = 404;
      throw error;
    }

    if (student.status === 'Suspended') {
      const error = new Error('Student account is currently suspended. Attendance cannot be marked.');
      error.statusCode = 403;
      throw error;
    }

    // 1. Verify that a meal is actively being served right now
    const mealData = await this.calculateCurrentMeal(managerHostelId);

    if (student.hostelId.toString() === managerHostelId.toString()) {
      // Find existing record to preserve selection count if any
      const existingRecord = await mealRecordRepository.findSingleRecord({
        hostelId: managerHostelId,
        date: mealData.date,
        mealType: mealData.mealType,
        rollNumber: student.id
      });

      // Same hostel, force upsert
      const record = await mealRecordRepository.findOneAndUpdate(
        { hostelId: managerHostelId, date: mealData.date, mealType: mealData.mealType, rollNumber: student.id },
        {
          $set: {
            hostelId: managerHostelId,
            date: mealData.date,
            mealType: mealData.mealType,
            mealInfo: mealData.mealInfo,
            rollNumber: student.id,
            studentId: student._id,
            isGuest: false,
            'attendance.hasEaten': true,
            'attendance.method': 'QR',
            'attendance.recordedBy': recordedById
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
        rollNumber: student.id,
        name: student.name,
        isGuest: false,
        mealType: mealData.mealType,
        date: mealData.date,
        count: record.attendance.count
      });

      return {
        status: 'success',
        message: 'Attendance marked successfully.',
        data: mealData
      };
    } else {
      // Different hostel, UI should prompt manager
      return {
        status: 'requires_permission',
        student: { _id: student._id, name: student.name, rollNumber: student.id, hostelId: student.hostelId },
        message: 'This student is from a different hostel. Accept as guest?'
      };
    }
  }

  // ==========================================
  // 6. BIOMETRIC HARDWARE ATTENDANCE IMPORT ENGINE
  // ==========================================
  async processBiometricAttendance(hostelId, user, payload) {
    const parsedData = processBiometricAttendanceSchema.parse(payload);
    const { records, unrecognizedStudentAction, duplicatePunchStrategy } = parsedData;

    // 1. Fetch MealSchedule for the hostel (from memory cache)
    const schedule = await mealService.getScheduleByHostel(hostelId);
    if (!schedule) {
      const error = new Error('Meal schedule not configured for this hostel.');
      error.statusCode = 404;
      throw error;
    }

    const mealNames = schedule.mealNames || [];
    const menu = schedule.menu || {};

    // 2. Fetch hostel residents for roster check
    const rawRollNumbers = records.map((r) => String(r.rollNumber).trim()).filter(Boolean);
    const uniqueRollNumbers = [...new Set(rawRollNumbers)];

    const enrolledStudents = await mealRecordRepository.findEnrolledStudents(hostelId, uniqueRollNumbers);
    const enrolledStudentMap = new Map();
    enrolledStudents.forEach((s) => {
      if (s.id) {
        enrolledStudentMap.set(String(s.id).toLowerCase().trim(), s);
        enrolledStudentMap.set(String(s.id).trim(), s);
      }
      if (s.email) {
        enrolledStudentMap.set(String(s.email).toLowerCase().trim(), s);
      }
    });

    // Also check global users for guest info
    const globalUsers = await mealRecordRepository.findUsersByIdsList(uniqueRollNumbers);
    const globalUserMap = new Map();
    globalUsers.forEach((u) => {
      if (u.id) {
        globalUserMap.set(String(u.id).toLowerCase().trim(), u);
        globalUserMap.set(String(u.id).trim(), u);
      }
      if (u.email) {
        globalUserMap.set(String(u.email).toLowerCase().trim(), u);
      }
    });

    // 3. Aggregate / Deduplicate Punches
    // Key: `${normRoll}_${date}_${mealType}`
    const punchAggregationMap = new Map();
    let skippedCount = 0;
    let guestsMarked = 0;

    records.forEach((record) => {
      const { rollNumber: rawRoll, date, mealType, count = 1, punchTime } = record;
      const rollNumber = String(rawRoll).trim();
      const normRoll = rollNumber.toLowerCase();
      const key = `${normRoll}_${date}_${mealType}`;

      const enrolledUser = enrolledStudentMap.get(normRoll) || enrolledStudentMap.get(rollNumber);
      const isEnrolled = !!enrolledUser;
      if (!isEnrolled) {
        if (unrecognizedStudentAction === 'skip') {
          skippedCount++;
          return;
        }
      }

      if (punchAggregationMap.has(key)) {
        const existing = punchAggregationMap.get(key);
        if (duplicatePunchStrategy === 'accumulate') {
          existing.count += count;
        }
        // if 'deduplicate', keep count as 1 (or max count seen)
      } else {
        const isGuest = !isEnrolled;
        if (isGuest) {
          guestsMarked++;
        }
        punchAggregationMap.set(key, {
          rollNumber: enrolledUser?.id || rollNumber,
          normRoll,
          date,
          mealType,
          count: duplicatePunchStrategy === 'accumulate' ? count : 1,
          isGuest,
          punchTime,
        });
      }
    });

    const aggregatedPunches = Array.from(punchAggregationMap.values());
    if (aggregatedPunches.length === 0) {
      return {
        success: true,
        message: 'No eligible records to process after applying filter rules.',
        stats: {
          totalSubmitted: records.length,
          totalProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          guestsMarked: 0,
          skippedCount,
        },
      };
    }

    // 4. Fetch existing MealRecords to check selection count preservation
    const queryDates = [...new Set(aggregatedPunches.map((p) => p.date))];
    const existingRecords = await mealRecordRepository.findRecordsByDatesAndRolls(
      hostelId,
      queryDates,
      uniqueRollNumbers
    );

    const existingRecordMap = new Map();
    existingRecords.forEach((r) => {
      if (r.rollNumber) {
        const rNorm = String(r.rollNumber).toLowerCase().trim();
        existingRecordMap.set(`${rNorm}_${r.date}_${r.mealType}`, r);
        existingRecordMap.set(`${String(r.rollNumber).trim()}_${r.date}_${r.mealType}`, r);
      }
      if (r.studentId) {
        const sIdStr = String(r.studentId).trim();
        existingRecordMap.set(`${sIdStr}_${r.date}_${r.mealType}`, r);
      }
    });

    // 5. Build Atomic Bulk Write Operations
    const bulkOps = [];
    let recordsCreated = 0;
    let recordsUpdated = 0;

    aggregatedPunches.forEach((punch) => {
      const { rollNumber, normRoll, date, mealType, count: punchCount, isGuest } = punch;
      const enrolledUser = enrolledStudentMap.get(normRoll) || enrolledStudentMap.get(rollNumber);
      const globalUser = globalUserMap.get(normRoll) || globalUserMap.get(rollNumber);
      const studentId = enrolledUser?._id || globalUser?._id || null;
      const canonicalRollNumber = enrolledUser?.id || rollNumber;

      const existing =
        existingRecordMap.get(`${normRoll}_${date}_${mealType}`) ||
        existingRecordMap.get(`${String(canonicalRollNumber).toLowerCase().trim()}_${date}_${mealType}`) ||
        existingRecordMap.get(`${rollNumber}_${date}_${mealType}`) ||
        (studentId ? existingRecordMap.get(`${String(studentId).trim()}_${date}_${mealType}`) : null);

      // Resolve mealInfo from schedule
      let mealInfoName = mealType;
      let mealInfoPrice = 0;

      try {
        const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
        });
        const mealIdx = mealNames.indexOf(mealType);
        if (mealIdx !== -1 && menu[dayName] && menu[dayName][mealIdx]) {
          const menuItem = menu[dayName][mealIdx];
          if (menuItem.meal && menuItem.meal !== 'none') mealInfoName = menuItem.meal;
          if (menuItem.price) mealInfoPrice = Number(menuItem.price) || 0;
        }
      } catch {
        // fallback
      }

      if (existing) {
        recordsUpdated++;
        bulkOps.push({
          updateOne: {
            filter: { _id: existing._id },
            update: {
              $set: {
                studentId: studentId || existing.studentId,
                isGuest,
                mealInfo: { name: mealInfoName, price: mealInfoPrice },
                'attendance.hasEaten': true,
                'attendance.method': 'Biometric',
                'attendance.recordedBy': user._id,
              },
              $inc: { 'attendance.count': punchCount },
            },
          },
        });
      } else {
        recordsCreated++;
        bulkOps.push({
          updateOne: {
            filter: { hostelId, date, mealType, rollNumber: canonicalRollNumber },
            update: {
              $set: {
                hostelId,
                date,
                mealType,
                rollNumber: canonicalRollNumber,
                studentId,
                isGuest,
                mealInfo: { name: mealInfoName, price: mealInfoPrice },
                'attendance.hasEaten': true,
                'attendance.count': punchCount,
                'attendance.method': 'Biometric',
                'attendance.recordedBy': user._id,
              },
              $setOnInsert: {
                'selection.hasSelected': false,
                'selection.count': 0,
              },
            },
            upsert: true,
          },
        });
      }
    });

    if (bulkOps.length > 0) {
      await mealRecordRepository.bulkWriteRecords(bulkOps);
    }

    // Emit live socket update for the hostel
    try {
      io.to(hostelId.toString()).emit('biometric_sync_success', {
        timestamp: new Date().toISOString(),
        totalProcessed: aggregatedPunches.length,
        recordsCreated,
        recordsUpdated,
      });
    } catch {
      // Ignore socket emit errors
    }

    return {
      success: true,
      message: `Successfully processed ${aggregatedPunches.length} biometric attendance records.`,
      stats: {
        totalSubmitted: records.length,
        totalProcessed: aggregatedPunches.length,
        recordsCreated,
        recordsUpdated,
        guestsMarked,
        skippedCount,
      },
    };
  }
}

export default new MealRecordService();
