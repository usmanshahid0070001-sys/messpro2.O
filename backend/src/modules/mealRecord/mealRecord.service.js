import jwt from 'jsonwebtoken';
import { io } from '../../server.js';
import User from '../auth/auth.model.js';
import Hostel from '../hostel/hostel.model.js';
import MealSchedule from '../meal/meal.model.js';

// 👇 Imported our new Repository instead of the raw Model
import mealRecordRepository from './mealRecord.repository.js';
import MealRecord from './mealRecord.model.js';
import { bulkSelectMealsSchema } from './mealRecord.validation.js';

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

class MealRecordService {
  // ==========================================
  // 1. STUDENT FEATURE: SELECT MEAL IN ADVANCE
  // ==========================================
  async bulkSelectMeals(student, hostelId, payload) {
    const { selections } = bulkSelectMealsSchema.parse(payload);
    
    const schedule = await MealSchedule.findOne({ hostelId });
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
      if (selection.count > maxAllowed) {
        const error = new Error(`Limit Exceeded: You can only select up to ${maxAllowed} meals.`);
        error.statusCode = 400;
        throw error;
      }

      if (selection.count === 0) {
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
                date: selection.date,
                mealType: selection.mealType,
                mealInfo: selection.mealInfo,
                rollNumber: student.id,
                studentId: student._id,
                isGuest: false,
                'selection.hasSelected': true,
                'selection.count': selection.count
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
    const hostel = await Hostel.findById(hostelId);
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
    const room = io.sockets.adapter.rooms.get(hostelId.toString());
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

    let record = await mealRecordRepository.findRecord({
      hostelId,
      date: mealData.date,
      mealType: mealData.mealType,
      rollNumber: student.id
    });

    if (record) {
      // UNSELECTED (Walk-In)
      if (!record.selection.hasSelected || record.selection.count === 0) {
        if (!autoVerification) {
          if (isManagerOnline) {
            return { status: 'requires_permission', reason: 'unselected', managerHostelId: hostelId, message: 'You did not reserve this meal. Request permission?' };
          } else {
            const error = new Error('Unselected meal rejected: Manager is offline.');
            error.statusCode = 403; throw error;
          }
        }
      } 
      // EXTRA MEAL (Attendance >= Selection)
      else if (record.attendance.count >= record.selection.count) {
        if (!autoVerification) {
          if (isManagerOnline) {
            return { status: 'requires_permission', reason: 'extra_meal', managerHostelId: hostelId, message: `You have reached your limit of ${record.selection.count} meals. Request extra meal?` };
          } else {
            const error = new Error(`Meal limit reached. Manager is offline to approve extra meals.`);
            error.statusCode = 403; throw error;
          }
        }
      }

      record.attendance.hasEaten = true;
      record.attendance.method = 'QR';
      record.attendance.count += 1;
      await record.save();

    } else {
      // 🛡️ WALK-IN SCENARIO (No Record Exists)
      if (!autoVerification) {
        if (isManagerOnline) {
          return { status: 'requires_permission', reason: 'unselected', managerHostelId: hostelId, message: 'You did not reserve this meal. Request permission?' };
        } else {
          const error = new Error('Unselected meal rejected: Manager is offline.');
          error.statusCode = 403; throw error;
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
    }

    // Emit live socket event to Manager's Dashboard
    io.to(hostelId.toString()).emit('attendance_success', {
      rollNumber: student.id,
      name: student.name,
      mealType: mealData.mealType,
      date: mealData.date,
      count: record.attendance.count,
      status: record.selection.hasSelected ? 'Pre-Selected' : 'Walk-In'
    });

    return { success: true, message: 'Meal successfully claimed!', record };
  }

  // ==========================================
  // 4. UTILITY FUNCTIONS
  // ==========================================

  // (Optional fallback if still using JWTs for alternative Manager Auth elsewhere)
  generateManagerQRToken(hostelId) {
    const payload = { type: 'manager_qr', hostelId: hostelId.toString() };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'messpro-dev-secret', { expiresIn: '365d' });
    return { token, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) };
  }

  async calculateCurrentMeal(hostelId) {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) throw new Error('Hostel not found');

    const schedule = await MealSchedule.findOne({ hostelId });
    if (!schedule || !schedule.selectionTiming || schedule.selectionTiming.length === 0) {
      throw new Error('Meal schedule timings not configured for this hostel');
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

    const currentMinutes = parseInt(localTimeParts[0]) * 60 + parseInt(localTimeParts[1]);

    let selectedMealIndex = -1;

    for (let i = 0; i < schedule.selectionTiming.length; i++) {
      const timingStr = schedule.selectionTiming[i];
      const [time, modifier] = timingStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);

      if (hours === 12 && modifier === 'AM') hours = 0;
      if (hours < 12 && modifier === 'PM') hours += 12;

      const thresholdMinutes = hours * 60 + parseInt(minutes, 10);

      if (currentMinutes >= thresholdMinutes) {
        selectedMealIndex = i;
      }
    }

    if (selectedMealIndex === -1) {
      const error = new Error('Invalid attendance time. No meal is currently active.');
      error.statusCode = 400;
      throw error;
    }

    const mealType = schedule.mealNames[selectedMealIndex];
    const todaysMenu = schedule.menu[localDayName] || [];
    const menuItem = todaysMenu[selectedMealIndex];

    const mealInfo = {
      name: menuItem?.meal && menuItem.meal !== 'none' ? menuItem.meal : 'Regular Meal',
      price: menuItem?.price || 0
    };

    return { 
      date: localDateStr, 
      mealType, 
      mealInfo,
      maxMealSelection: schedule.maxMealSelection || 1
    };
  }
}

export default new MealRecordService();