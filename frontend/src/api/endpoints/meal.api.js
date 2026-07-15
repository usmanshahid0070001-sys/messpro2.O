import api from '../client';

export const mealApi = {
  getMealSettings: async () => {
    const response = await api.get('/api/meal/settings');
    return response.data;
  },
  
  updateMealSettings: async (settings) => {
    const response = await api.put('/api/meal/settings', settings);
    return response.data;
  },
  
  getMenu: async () => {
    const response = await api.get('/api/meal/menu');
    return response.data;
  },

  updateMenu: async (menuData) => {
    const response = await api.put('/api/meal/menu', menuData);
    return response.data;
  },

  getWeeklySelections: async (dates) => {
    const response = await api.post('/api/meal/weekly-selections', { dates });
    return response.data;
  },
  
  getMenuSchedule: async () => {
    const response = await api.get('/api/meal/menu-schedule');
    return response.data;
  },
  
  getMealHistory: async (year, month) => {
    const response = await api.get(`/api/meal/history?year=${year}&month=${month}`);
    return response.data;
  },

  updateMealSelections: async (selections) => {
    const response = await api.post('/api/meal/update-selections', { selections });
    return response.data;
  }
};
