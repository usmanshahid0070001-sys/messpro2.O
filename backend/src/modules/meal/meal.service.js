import MealSchedule from './meal.model.js';
import mongoose from 'mongoose';
import MealRecord from '../mealRecord/mealRecord.model.js';

class MealService {
  async getScheduleByHostel(hostelId) {
    // Fetches the single meal document for this specific hostel
    const schedule = await MealSchedule.findOne({ hostelId });
    return schedule; 
  }

  async upsertSchedule(hostelId, updateData) {
    // UPSERT MAGIC: If it finds the document, it updates it. 
    // If it DOES NOT find it, it creates it automatically!
    const schedule = await MealSchedule.findOneAndUpdate(
      { hostelId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );
    return schedule;
  }


// ==========================================
  // 5. MEAL CONTROL & VIOLATION TRACKER
  // ==========================================
  
  async getMealViolations(hostelId, date) {
    const pipeline = [
      {
        $match: {
          hostelId: new mongoose.Types.ObjectId(hostelId),
          date: date // You can also upgrade this to take a startDate and endDate later
        }
      },
      // 1. Do the Math: Compare Selection vs. Attendance
      {
        $project: {
          date: 1,
          mealType: 1,
          rollNumber: 1,
          studentId: 1,
          selectionCount: { $ifNull: ['$selection.count', 0] },
          attendanceCount: { $ifNull: ['$attendance.count', 0] },
          
          // Missed Meals (Wastage): If they selected 3 but ate 1, returns 2.
          missedMeals: {
            $max: [0, { $subtract: [{ $ifNull: ['$selection.count', 0] }, { $ifNull: ['$attendance.count', 0] }] }]
          },
          
          // Extra Meals (Violations): If they selected 1 but ate 4, returns 3.
          extraMeals: {
            $max: [0, { $subtract: [{ $ifNull: ['$attendance.count', 0] }, { $ifNull: ['$selection.count', 0] }] }]
          }
        }
      },
      // 2. Filter: Only keep students who actually have a violation > 0
      {
        $match: {
          $or: [
            { missedMeals: { $gt: 0 } },
            { extraMeals: { $gt: 0 } }
          ]
        }
      },
      // 3. Populate Student Details for the Printable Sheet
      {
        $lookup: {
          from: 'users', // Must match your auth.model collection name
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: { path: '$studentInfo', preserveNullAndEmptyArrays: true }
      },
      // 4. Format the final output for the frontend
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
              { $gt: ['$extraMeals', 0] }, 'Extra/Unselected Eaten', 'Missed/Wasted'
            ]
          }
        }
      },
      { $sort: { rollNumber: 1 } }
    ];

    const violations = await MealRecord.aggregate(pipeline);
    return violations;
  }



}

export default new MealService();
