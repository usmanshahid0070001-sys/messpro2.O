import mongoose from 'mongoose';
import MealSchedule from './meal.model.js';
import MealRecord from '../mealRecord/mealRecord.model.js';

class MealRepository {
  /**
   * Fetch meal schedule for a hostel
   */
  async findScheduleByHostel(hostelId) {
    if (!hostelId) return null;
    return await MealSchedule.findOne({ hostelId }).lean();
  }

  /**
   * Upsert meal schedule for a hostel
   */
  async upsertSchedule(hostelId, updateData) {
    return await MealSchedule.findOneAndUpdate(
      { hostelId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).lean();
  }

  /**
   * Delete meal schedule for a hostel
   */
  async deleteSchedule(hostelId) {
    return await MealSchedule.findOneAndDelete({ hostelId });
  }

  /**
   * Query meal violations comparing selection portions vs actual attendance
   */
  async getMealViolations(hostelId, date) {
    const objectId = typeof hostelId === 'string' ? new mongoose.Types.ObjectId(hostelId) : hostelId;

    const pipeline = [
      {
        $match: {
          hostelId: objectId,
          date: date,
        },
      },
      // 1. Compare Selection vs. Attendance
      {
        $project: {
          date: 1,
          mealType: 1,
          rollNumber: 1,
          studentId: 1,
          selectionCount: { $ifNull: ['$selection.count', 0] },
          attendanceCount: { $ifNull: ['$attendance.count', 0] },
          // Missed Meals (Wastage): selected > eaten
          missedMeals: {
            $max: [
              0,
              {
                $subtract: [
                  { $ifNull: ['$selection.count', 0] },
                  { $ifNull: ['$attendance.count', 0] },
                ],
              },
            ],
          },
          // Extra Meals (Violations): eaten > selected
          extraMeals: {
            $max: [
              0,
              {
                $subtract: [
                  { $ifNull: ['$attendance.count', 0] },
                  { $ifNull: ['$selection.count', 0] },
                ],
              },
            ],
          },
        },
      },
      // 2. Filter: Only keep records with non-zero violations
      {
        $match: {
          $or: [
            { missedMeals: { $gt: 0 } },
            { extraMeals: { $gt: 0 } },
          ],
        },
      },
      // 3. Populate Student Info
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      {
        $unwind: { path: '$studentInfo', preserveNullAndEmptyArrays: true },
      },
      // 4. Format final response projection
      {
        $project: {
          _id: 1,
          date: 1,
          mealType: 1,
          rollNumber: 1,
          studentName: '$studentInfo.name',
          selectionCount: 1,
          attendanceCount: 1,
          missedMeals: 1,
          extraMeals: 1,
          violationType: {
            $cond: [
              { $gt: ['$extraMeals', 0] },
              'Extra/Unselected Eaten',
              'Missed/Wasted',
            ],
          },
        },
      },
      { $sort: { rollNumber: 1 } },
    ];

    return await MealRecord.aggregate(pipeline);
  }
}

export default new MealRepository();
