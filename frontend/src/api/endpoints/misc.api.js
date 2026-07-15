import api from '../client';

export const miscApi = {
  getDashboardStats: async (month) => {
    const response = await api.get(`/api/misc/dashboard-stats?month=${month}`);
    return response.data;
  },

  getDailyCounts: async (date) => {
    const response = await api.get(`/api/misc/daily-counts?date=${date}`);
    return response.data;
  }
};
