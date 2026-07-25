import Attendance from './attendance.model.js';
import User from '../auth/auth.model.js';

class AttendanceService {
  /**
   * Fetch attendance records for a specific hostel, date, and meal type
   */
  async getAttendance(hostelId, date, mealType) {
    const attendances = await Attendance.find({
      hostel: hostelId,
      date,
      mealType
    }).populate('userRef', 'name email id role');

    return attendances;
  }

  /**
   * Save or update attendance records in bulk
   */
  async upsertAttendance(hostelId, date, mealType, mealInfo, records, recordedBy) {
    // Deduplicate incoming records (last one wins)
    const uniqueRecordsMap = new Map();
    records.forEach(r => uniqueRecordsMap.set(r.rollNumber, r));
    const uniqueRecords = Array.from(uniqueRecordsMap.values());

    const rollNumbers = uniqueRecords.map(r => r.rollNumber);
    
    // Global User Lookup
    const existingUsers = await User.find({ id: { $in: rollNumbers } }).select('_id id hostelId');
    const userMap = new Map();
    existingUsers.forEach(u => {
      userMap.set(u.id, u);
    });

    const bulkOps = uniqueRecords.map(record => {
      const { rollNumber, count } = record;
      const user = userMap.get(rollNumber);
      
      const isGuest = !user || user.hostelId.toString() !== hostelId.toString();
      const userRef = user ? user._id : null;

      if (count === 0) {
        return {
          deleteOne: {
            filter: { hostel: hostelId, date, mealType, rollNumber }
          }
        };
      } else {
        return {
          updateOne: {
            filter: { hostel: hostelId, date, mealType, rollNumber },
            update: {
              $set: {
                hostel: hostelId,
                date,
                mealType,
                mealInfo,
                rollNumber,
                count,
                isGuest,
                userRef,
                recordedBy
              }
            },
            upsert: true
          }
        };
      }
    });

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }
  }
}

export default new AttendanceService();
