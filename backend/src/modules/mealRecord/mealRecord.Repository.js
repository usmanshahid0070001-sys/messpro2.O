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

  // async findStudentByRollNumber(identifier) {
  //   if (!identifier) return null;
  //   let str = String(identifier).trim();

  //   // 1. If it's a JSON string, extract any embedded student identifier
  //   let embeddedId = null;
  //   let embeddedRoll = null;
  //   try {
  //     const parsed = JSON.parse(str);
  //     if (parsed && typeof parsed === 'object') {
  //       embeddedRoll = parsed.rollNumber || parsed.studentRollNumber;
  //       embeddedId = parsed.studentId || parsed._id || parsed.id;
  //       str = String(embeddedRoll || embeddedId || str).trim();
  //     }
  //   } catch {
  //     // If not JSON, check if it's URL-encoded or contains key-value pairs
  //     const rollMatch = str.match(/"?(?:rollNumber|studentRollNumber)"?\s*[:=]\s*"?([a-zA-Z0-9_-]+)"?/i);
  //     const idMatch = str.match(/"?(?:studentId|id|_id)"?\s*[:=]\s*"?([a-f0-9]{24}|[a-zA-Z0-9_-]+)"?/i);
  //     if (rollMatch && rollMatch[1]) embeddedRoll = rollMatch[1].trim();
  //     if (idMatch && idMatch[1]) embeddedId = idMatch[1].trim();
  //     if (embeddedRoll || embeddedId) {
  //       str = String(embeddedRoll || embeddedId).trim();
  //     }
  //   }

  //   const identifiersToTest = new Set([
  //     str,
  //     str.toLowerCase(),
  //     str.toUpperCase(),
  //     str.replace(/\s+/g, ''),
  //   ]);
  //   if (embeddedRoll) {
  //     identifiersToTest.add(embeddedRoll);
  //     identifiersToTest.add(embeddedRoll.toLowerCase());
  //   }
  //   if (embeddedId) {
  //     identifiersToTest.add(embeddedId);
  //     identifiersToTest.add(embeddedId.toLowerCase());
  //   }

  //   const orConditions = [];

  //   for (const val of identifiersToTest) {
  //     if (!val) continue;
  //     orConditions.push({ id: val });
  //     orConditions.push({ email: val });
  //     if (mongoose.isValidObjectId(val)) {
  //       orConditions.push({ _id: new mongoose.Types.ObjectId(val) });
  //     }
  //     const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  //     orConditions.push({ id: { $regex: new RegExp(`^${escaped}$`, 'i') } });
  //   }

  //   return User.findOne({
  //     $or: orConditions
  //   });
  // }

  async findStudentByRollNumber(identifier) {
    if (!identifier) return null;

    // 1. Convert to string and sanitize null bytes & non-printable control characters
    let str = String(identifier).replace(/\0/g, '').trim();
    if (!str) return null;

    // 2. If it's a JSON string, extract any embedded student identifier
    let embeddedId = null;
    let embeddedRoll = null;
    try {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed === 'object') {
        embeddedRoll = parsed.rollNumber || parsed.studentRollNumber;
        embeddedId = parsed.studentId || parsed._id || parsed.id;
        str = String(embeddedRoll || embeddedId || str).replace(/\0/g, '').trim();
      }
    } catch {
      // If not JSON, check if it's URL-encoded or contains key-value pairs
      const rollMatch = str.match(/"?(?:rollNumber|studentRollNumber)"?\s*[:=]\s*"?([a-zA-Z0-9_.-]+)"?/i);
      const idMatch = str.match(/"?(?:studentId|id|_id)"?\s*[:=]\s*"?([a-f0-9]{24}|[a-zA-Z0-9_.-]+)"?/i);
      if (rollMatch && rollMatch[1]) embeddedRoll = rollMatch[1].replace(/\0/g, '').trim();
      if (idMatch && idMatch[1]) embeddedId = idMatch[1].replace(/\0/g, '').trim();
      if (embeddedRoll || embeddedId) {
        str = String(embeddedRoll || embeddedId).trim();
      }
    }

    const identifiersToTest = new Set([
      str,
      str.toLowerCase(),
      str.toUpperCase(),
      str.replace(/\s+/g, ''),
    ]);
    if (embeddedRoll) {
      identifiersToTest.add(embeddedRoll);
      identifiersToTest.add(embeddedRoll.toLowerCase());
    }
    if (embeddedId) {
      identifiersToTest.add(embeddedId);
      identifiersToTest.add(embeddedId.toLowerCase());
    }

    const orConditions = [];

    for (const val of identifiersToTest) {
      if (!val) continue;

      // Direct exact match
      orConditions.push({ id: val });
      orConditions.push({ email: val });

      if (mongoose.isValidObjectId(val)) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(val) });
      }

      // 3. SAFE REGEX: Only evaluate regex on valid printable strings (no binary or control characters)
      if (val.length <= 50 && !/[\x00-\x1F\x7F]/.test(val)) {
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        orConditions.push({
          id: { $regex: `^${escaped}$`, $options: 'i' }
        });
      }
    }

    if (orConditions.length === 0) return null;

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