import mongoose from 'mongoose';
import MealRecord from './mealRecord.model.js';
import User from '../auth/auth.model.js';
import Hostel from '../hostel/hostel.model.js';

class MealRecordRepository {
  // ==========================================
  // MEAL RECORD QUERIES
  // ==========================================

  async findExistingRecords(hostelId, rollNumber, dates) {
    return MealRecord.find({
      hostelId,
      rollNumber,
      date: { $in: dates }
    });
  }

  async getStudentSelections(rollNumber, hostelId, startDate, endDate) {
    return MealRecord.find({
      rollNumber,
      hostelId,
      date: { $gte: startDate, $lte: endDate }
    }).select('date mealType selection').lean();
  }

  async getStudentMonthlyRecords(filter) {
    return MealRecord.find(filter)
      .select('date mealType selection attendance mealInfo isGuest rollNumber')
      .sort({ date: 1 })
      .lean();
  }

  async getPopulatedAttendance(filter) {
    return MealRecord.find(filter)
      .populate('attendance.recordedBy', 'name email')
      .populate('studentId', 'name id roomNumber')
      .lean();
  }

  async findAttendanceRecordsForUpsert(hostelId, date, mealType, rollNumbers, lowerRolls) {
    return MealRecord.find({
      hostelId,
      date,
      mealType,
      $or: [
        { rollNumber: { $in: rollNumbers } },
        { rollNumber: { $in: lowerRolls } }
      ]
    });
  }

  async findSingleRecord(filter) {
    return MealRecord.findOne(filter);
  }

  async findDailyRecords(hostelId, date) {
    return MealRecord.find({ hostelId, date })
      .populate('studentId', 'name id')
      .lean();
  }

  async findRecordsByDatesAndRolls(hostelId, dates, rollNumbers) {
    const hostelIdStr = hostelId ? hostelId.toString() : '';
    const hostelQuery = mongoose.isValidObjectId(hostelIdStr)
      ? { $in: [hostelIdStr, new mongoose.Types.ObjectId(hostelIdStr)] }
      : hostelIdStr;

    return MealRecord.find({
      hostelId: hostelQuery,
      date: { $in: dates },
    }).lean();
  }

  async createRecord(data) {
    return MealRecord.create(data);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return MealRecord.findOneAndUpdate(filter, update, options);
  }

  async bulkWriteRecords(bulkOps) {
    if (!bulkOps || bulkOps.length === 0) return null;
    return MealRecord.bulkWrite(bulkOps);
  }

  // ==========================================
  // USER QUERIES FOR MEAL ATTENDANCE
  // ==========================================

  async findUsersByRollsOrIds(rollNumbers, lowerRolls, objectIdRolls = []) {
    return User.find({
      $or: [
        { id: { $in: rollNumbers } },
        { id: { $in: lowerRolls } },
        ...(objectIdRolls.length > 0 ? [{ _id: { $in: objectIdRolls } }] : [])
      ]
    }).select('_id id name hostelId role email').lean();
  }

  async findUsersByIdsList(rolls) {
    const cleanRolls = (rolls || []).map((r) => String(r).trim()).filter(Boolean);
    const lowerRolls = cleanRolls.map((r) => r.toLowerCase());
    const allRolls = [...new Set([...cleanRolls, ...lowerRolls])];
    return User.find({
      $or: [
        { id: { $in: allRolls } },
        { email: { $in: lowerRolls } }
      ]
    }).select('_id id name hostelId role email').lean();
  }

  async findEnrolledStudents(hostelId, rollNumbers) {
    const hostelIdStr = hostelId ? hostelId.toString() : '';
    const hostelQuery = mongoose.isValidObjectId(hostelIdStr)
      ? { $in: [hostelIdStr, new mongoose.Types.ObjectId(hostelIdStr)] }
      : hostelIdStr;

    // Fetch all student users for this hostel to guarantee 100% case-insensitive JavaScript map matching
    return User.find({
      hostelId: hostelQuery,
      role: 'student',
    }).select('_id id name hostelId role email').lean();
  }

  async findStudentsByHostel(hostelId) {
    return User.find({ hostelId, role: 'student' }).select('name id').lean();
  }

  async findStudentByRollNumber(identifier) {
    if (!identifier) return null;
    let str = String(identifier).trim();

    try {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed === 'object') {
        str = String(parsed.rollNumber || parsed.id || parsed.studentRollNumber || parsed.studentId || str).trim();
      }
    } catch {}

    const orConditions = [
      { id: str },
      { id: str.toLowerCase() },
      { email: str.toLowerCase() }
    ];

    if (mongoose.isValidObjectId(str)) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(str) });
    }

    // Escape regex characters and do case-insensitive exact match
    const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    orConditions.push({ id: { $regex: new RegExp(`^${escaped}$`, 'i') } });

    return User.findOne({
      $or: orConditions
    });
  }

  async findUserById(id) {
    return User.findById(id);
  }

  // ==========================================
  // HOSTEL QUERIES
  // ==========================================

  async findHostelById(hostelId) {
    return Hostel.findById(hostelId);
  }
}

export default new MealRecordRepository();