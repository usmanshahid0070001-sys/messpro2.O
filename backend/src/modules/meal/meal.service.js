import mealRepository from './meal.repository.js';
import cache from '../../config/cache.js';

class MealService {
  /**
   * Fetch hostel weekly meal schedule with read-through caching
   */
  async getScheduleByHostel(hostelId) {
    if (!hostelId) {
      const error = new Error('Hostel ID is required to retrieve meal schedule.');
      error.statusCode = 400;
      throw error;
    }

    const cacheKey = `hostel:meal_schedule:${hostelId}`;

    // Read through cache with 30m base TTL + 5m jitter
    return await cache.getOrSet(
      cacheKey,
      async () => {
        return await mealRepository.findScheduleByHostel(hostelId);
      },
      1800,
      300
    );
  }

  /**
   * Upsert hostel weekly meal schedule with write-through caching
   */
  async upsertSchedule(hostelId, updateData) {
    if (!hostelId) {
      const error = new Error('Hostel ID is required to update meal schedule.');
      error.statusCode = 400;
      throw error;
    }

    const schedule = await mealRepository.upsertSchedule(hostelId, updateData);

    // Write-through cache synchronization
    if (schedule) {
      const cacheKey = `hostel:meal_schedule:${hostelId}`;
      await cache.set(cacheKey, schedule, 1800, 300);
    }

    return schedule;
  }

  /**
   * Query meal violations comparing student booking portions against dining attendance
   */
  async getMealViolations(hostelId, date) {
    if (!hostelId) {
      const error = new Error('Hostel ID is required to query meal violations.');
      error.statusCode = 400;
      throw error;
    }

    if (!date) {
      const error = new Error('Date is required to fetch meal violations.');
      error.statusCode = 400;
      throw error;
    }

    return await mealRepository.getMealViolations(hostelId, date);
  }
}

export default new MealService();
