import MealSchedule from './meal.model.js';

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
}

export default new MealService();