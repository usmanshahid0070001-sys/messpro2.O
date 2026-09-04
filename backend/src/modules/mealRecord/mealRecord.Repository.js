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
    return MealRecord.find({
      hostelId,
      date: { $in: dates },
      rollNumber: { $in: rollNumbers }
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
    }).select('_id id name hostelId').lean();
  }

  async findUsersByIdsList(rolls) {
    return User.find({ id: { $in: rolls } }).select('_id id name hostelId').lean();
  }

  async findEnrolledStudents(hostelId, rollNumbers) {
    return User.find({
      id: { $in: rollNumbers },
      hostelId,
      role: 'student'
    }).select('_id id name hostelId').lean();
  }

  async findStudentsByHostel(hostelId) {
    return User.find({ hostelId, role: 'student' }).select('name id').lean();
  }

  async findStudentByRollNumber(rollNumber) {
    return User.findOne({ id: rollNumber, role: 'student' });
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