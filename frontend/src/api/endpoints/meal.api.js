import api from '../client';

export const mealApi = {
  getMealSchedule: async () => {
    const response = await api.get('/api/meal-schedule');
    return response.data;
  },
  
  updateMealSchedule: async (data) => {
    const response = await api.put('/api/meal-schedule', data);
    return response.data;
  },
  
  getMonthlyRecords: async (month) => {
    const response = await api.get(`/api/attendance/monthly?month=${month}`);
    return response.data;
  }
};
