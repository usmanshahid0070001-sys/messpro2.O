import MealSchedule from './meal.model.js';
import { cache } from '../../config/cache.js';

class MealService {
  async getScheduleByHostel(hostelId) {
    if (!hostelId) return null;
    const cacheKey = `hostel:meal_schedule:${hostelId}`;

    // Read through cache with 30m base TTL + 5m jitter
    return await cache.getOrSet(
      cacheKey,
      async () => {
        return await MealSchedule.findOne({ hostelId }).lean();
      },
      1800,
      300
    );
  }

  async upsertSchedule(hostelId, updateData) {
    // UPSERT: update or create in MongoDB
    const schedule = await MealSchedule.findOneAndUpdate(
      { hostelId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // Instantly sync/update in-memory cache (Write-through)
    if (schedule && hostelId) {
      const cacheKey = `hostel:meal_schedule:${hostelId}`;
      await cache.set(cacheKey, schedule, 1800, 300);
    }

    return schedule;
  }
}

export default new MealService();