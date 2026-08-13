import MealRecord from './mealRecord.model.js';

class MealRecordRepository {
  
  async findRecord(query) {
    return await MealRecord.findOne(query);
  }

  async getStudentMonthlyRecords(query) {
    return await MealRecord.find(query).select('date mealType mealInfo selection attendance isGuest');
  }

  async getPopulatedAttendance(query) {
    return await MealRecord.find(query).populate('studentId', 'name email id role');
  }

  async createRecord(data) {
    return await MealRecord.create(data);
  }

  async upsertRecord(filter, updateData) {
    return await MealRecord.findOneAndUpdate(
      filter,
      updateData,
      { upsert: true, new: true }
    );
  }

  async bulkWriteRecords(operations) {
    if (operations.length > 0) {
      return await MealRecord.bulkWrite(operations);
    }
    return null;
  }
}

export default new MealRecordRepository();