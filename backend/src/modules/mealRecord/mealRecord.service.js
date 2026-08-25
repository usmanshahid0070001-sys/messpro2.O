import jwt from 'jsonwebtoken';
import { io } from '../../server.js';
import User from '../auth/auth.model.js';
import Hostel from '../hostel/hostel.model.js';
import MealSchedule from '../meal/meal.model.js';
import mealService from '../meal/meal.service.js';
import hostelService from '../hostel/hostel.service.js';

// 👇 Imported our new Repository instead of the raw Model
import mealRecordRepository from './mealRecord.Repository.js';
import MealRecord from './mealRecord.model.js';
import { bulkSelectMealsSchema, processBiometricAttendanceSchema } from './mealRecord.validation.js';

// ==========================================
// HELPER: Haversine Formula for GPS distance
// ==========================================
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

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

class MealRecordService {
  // ==========================================
  // 1. STUDENT FEATURE: SELECT MEAL IN ADVANCE
  // ==========================================
  async bulkSelectMeals(student, hostelId, payload) {
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
    const timezone = hostel?.location || 'Asia/Karachi';
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
    const existingRecords = await MealRecord.find({
      hostelId,
      rollNumber: student.id,
      date: { $in: selections.map(s => s.date) }
    });
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
    const records = await MealRecord.find({
      rollNumber,
      hostelId,
      date: { $gte: startDate, $lte: endDate }
    }).select('date mealType selection');

    return records;
  }

  async getStudentMonthlyRecords(rollNumber, hostelId, month) {
    // month is expected to be 'YYYY-MM'
    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // Simple string matching, handles up to 31st

    const records = await mealRecordRepository.getStudentMonthlyRecords({
      rollNumber,
      hostelId,
      date: { $gte: startDate, $lte: endDate }
    });

    return records;
  }

  // ==========================================
  // 2. MANAGER FEATURE: FETCH & BULK UPSERT
  // =l=========================================

  async getAttendance(hostelId, date, mealType) {
    return await mealRecordRepository.getPopulatedAttendance({ hostelId, date, mealType });
  }

  async upsertAttendance(hostelId, date, mealType, mealInfo, records, recordedBy) {
    // 1. Deduplicate incoming records (last one wins)
    const uniqueRecordsMap = new Map();
    records.forEach(r => uniqueRecordsMap.set(r.rollNumber, r));
    const uniqueRecords = Array.from(uniqueRecordsMap.values());
    const rollNumbers = uniqueRecords.map(r => r.rollNumber);

    // Fetch existing records to check their selection counts
    const existingRecords = await MealRecord.find({
      hostelId, date, mealType, rollNumber: { $in: rollNumbers }
    });
    const recordMap = new Map();
    existingRecords.forEach(r => recordMap.set(r.rollNumber, r));

    // 2. Global User Lookup (to check if they are guests)
    const existingUsers = await User.find({ id: { $in: rollNumbers } }).select('_id id hostelId');
    const userMap = new Map();
    existingUsers.forEach(u => userMap.set(u.id, u));

    const bulkOps = [];

    // 3. Map the UI's exact counts to the Database
    uniqueRecords.forEach(record => {
      // This 'count' is the exact number from the Manager's +/- UI buttons
      const { rollNumber, count: uiCount } = record;
      const user = userMap.get(rollNumber);

      const isGuest = !user || user.hostelId.toString() !== hostelId.toString();
      const studentId = user ? user._id : null;

      if (uiCount === 0) {
        // Manager clicked '-' until it reached 0. 
        const existingRecord = recordMap.get(rollNumber);
        const selCount = existingRecord?.selection?.count || 0;

        if (selCount === 0) {
          // Both selection and attendance are 0, completely delete the document
          bulkOps.push({
            deleteOne: {
              filter: { hostelId, date, mealType, rollNumber }
            }
          });
        } else {
          // We reset the attendance side but keep their pre-selection alive!
          bulkOps.push({
            updateOne: {
              filter: { hostelId, date, mealType, rollNumber },
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
        // Manager clicked '+' and hit save. We overwrite the count!
        bulkOps.push({
          updateOne: {
            filter: { hostelId, date, mealType, rollNumber },
            update: {
              $set: {
                hostelId, date, mealType, mealInfo, rollNumber, isGuest, studentId,
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
  async processStudentScan(student, hostelId, scannedSecret, studentLat, studentLng) {
    const hostel = await hostelService.getHostelById(hostelId);
    if (!hostel) throw new Error('Hostel not found.');

    // 🛡️ SECURITY 1: Anti-Forgery (Matches the printed static string)
    if (hostel.qrSecret !== scannedSecret) {
      const error = new Error('Invalid or expired QR Code.');
      error.statusCode = 401;
      throw error;
    }

    // 🛡️ SECURITY 2: Geofencing (Must be within 30 meters)
    if (hostel.locationCoords && hostel.locationCoords.lat && hostel.locationCoords.lng) {
      const distance = calculateDistanceInMeters(
        hostel.locationCoords.lat, hostel.locationCoords.lng,
        studentLat, studentLng
      );

      if (distance > 30) {
        const error = new Error(`Scan rejected. You are ${distance} meters away. You must be within 30 meters of the dining hall.`);
        error.statusCode = 403;
        throw error;
      }
    }

    // 🛡️ SECURITY 3: Time Validation (Determine current meal)
    const mealData = await this.calculateCurrentMeal(hostelId);

    const isGuest = student.hostelId.toString() !== hostelId.toString();
    const room = io.sockets.adapter.rooms.get(`hostel:${hostelId}`);
    const isManagerOnline = room && room.size > 0;
    const autoVerification = hostel.settings?.autoVerification || false;

    // GUEST LOGIC
    if (isGuest) {
      if (isManagerOnline) {
        return {
          status: 'requires_permission',
          reason: 'guest',
          managerHostelId: hostelId,
          message: 'You are not registered in this hostel. Do you want to request guest permission?'
        };
      } else {
        const error = new Error('Guest scan rejected: Manager is offline.');
        error.statusCode = 403;
        throw error;
      }
    }

    // 🛡️ FIND TODAY'S RECORD FOR REGISTERED STUDENT
    let record = await MealRecord.findOne({
      hostelId,
      date: mealData.date,
      mealType: mealData.mealType,
      rollNumber: student.id
    });

    if (!record) {
      // 🛡️ WALK-IN SCENARIO (No Record Exists)
      if (!autoVerification) {
        if (isManagerOnline) {
          return {
            status: 'requires_permission',
            reason: 'unselected',
            managerHostelId: hostelId,
            message: 'You did not reserve this meal. Request permission?'
          };
        } else {
          const error = new Error('Unselected meal rejected: Manager is offline.');
          error.statusCode = 403;
          throw error;
        }
      }

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
          if (isManagerOnline) {
            return {
              status: 'requires_permission',
              reason: 'unselected',
              managerHostelId: hostelId,
              message: 'You did not reserve this meal. Request permission?'
            };
          } else {
            const error = new Error('Unselected meal rejected: Manager is offline.');
            error.statusCode = 403;
            throw error;
          }
        }
      } else if (isLimitReached) {
        // EXTRA MEAL (Attendance >= Selection)
        if (!autoVerification) {
          if (isManagerOnline) {
            return {
              status: 'requires_permission',
              reason: 'extra_meal',
              managerHostelId: hostelId,
              message: `You have reached your limit of ${record.selection.count} meals. Request extra meal?`
            };
          } else {
            const error = new Error('Meal limit reached. Manager is offline to approve extra meals.');
            error.statusCode = 403;
            throw error;
          }
        }
      }

      record.attendance.hasEaten = true;
      record.attendance.method = 'QR';
      record.attendance.count = (record.attendance.count || 0) + 1;
      await record.save();
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

    return {
      status: 'success',
      message: 'Attendance marked successfully.',
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
  // 4. MANAGER QR CODE LOGIC (100% RELIABLE)
  // ==========================================
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

    const timezone = hostel.location || 'Asia/Karachi';
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
    if (selectedMealIndex === -1 && servingTimes.length === 0) {
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
      const error = new Error('No meal is currently being served at this time. Please scan during the scheduled serving hours.');
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

  // ==========================================
  // 5. BIOMETRIC HARDWARE ATTENDANCE IMPORT ENGINE
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
    const rawRollNumbers = records.map((r) => r.rollNumber);
    const uniqueRollNumbers = [...new Set(rawRollNumbers)];

    const enrolledStudents = await User.find({
      id: { $in: uniqueRollNumbers },
      hostelId: hostelId,
      role: 'student',
    })
      .select('_id id name hostelId')
      .lean();

    const enrolledStudentMap = new Map();
    enrolledStudents.forEach((s) => enrolledStudentMap.set(s.id, s));

    // Also check global users for guest info
    const globalUsers = await User.find({
      id: { $in: uniqueRollNumbers },
    })
      .select('_id id name hostelId')
      .lean();

    const globalUserMap = new Map();
    globalUsers.forEach((u) => globalUserMap.set(u.id, u));

    // 3. Aggregate / Deduplicate Punches
    // Key: `${rollNumber}_${date}_${mealType}`
    const punchAggregationMap = new Map();
    let skippedCount = 0;
    let guestsMarked = 0;

    records.forEach((record) => {
      const { rollNumber, date, mealType, count = 1, punchTime } = record;
      const key = `${rollNumber}_${date}_${mealType}`;

      const isEnrolled = enrolledStudentMap.has(rollNumber);
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
          rollNumber,
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
    const existingRecords = await MealRecord.find({
      hostelId,
      date: { $in: queryDates },
      rollNumber: { $in: uniqueRollNumbers },
    }).lean();

    const existingRecordMap = new Map();
    existingRecords.forEach((r) => {
      existingRecordMap.set(`${r.rollNumber}_${r.date}_${r.mealType}`, r);
    });

    // 5. Build Atomic Bulk Write Operations
    const bulkOps = [];
    let recordsCreated = 0;
    let recordsUpdated = 0;

    aggregatedPunches.forEach((punch) => {
      const { rollNumber, date, mealType, count: punchCount, isGuest } = punch;
      const existing = existingRecordMap.get(`${rollNumber}_${date}_${mealType}`);

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

      const enrolledUser = enrolledStudentMap.get(rollNumber);
      const globalUser = globalUserMap.get(rollNumber);
      const studentId = enrolledUser?._id || globalUser?._id || null;

      if (existing) {
        recordsUpdated++;
        bulkOps.push({
          updateOne: {
            filter: { hostelId, date, mealType, rollNumber },
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
            filter: { hostelId, date, mealType, rollNumber },
            update: {
              $set: {
                hostelId,
                date,
                mealType,
                rollNumber,
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
