import api from '../client';

export const studentApi = {
  getWeeklySelections: async (dates) => {
    const response = await api.post('/api/student/weekly-selections', { dates });
    return response.data;
  },
  
  getMenuSchedule: async () => {
    const response = await api.get('/api/student/menu-schedule');
    return response.data;
  },
  
  getMealHistory: async (year, month) => {
    const response = await api.get(`/api/student/meal-history?year=${year}&month=${month}`);
    return response.data;
  },
  
  getMonthlyBill: async (month) => {
    const response = await api.get(`/api/student/monthly-bill?month=${month}`);
    return response.data;
  },
  
  updateMealSelections: async (selections) => {
    const response = await api.post('/api/student/update-selections', { selections });
    return response.data;
  }
};
