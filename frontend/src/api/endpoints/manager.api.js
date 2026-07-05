import api from '../client';

export const managerApi = {
  getDailyCounts: async (date) => {
    const response = await api.get(`/api/manager/daily-counts?date=${date}`);
    return response.data;
  },
  
  getMenu: async () => {
    const response = await api.get('/api/manager/menu');
    return response.data;
  },
  
  getAllBills: async () => {
    const response = await api.get('/api/manager/bills');
    return response.data;
  },
  
  payBill: async (billId) => {
    const response = await api.post(`/api/manager/bills/${billId}/pay`);
    return response.data;
  },
  
  partialPayBill: async (billId, amount) => {
    const response = await api.post(`/api/manager/bills/${billId}/partial-pay`, { amount });
    return response.data;
  },
  
  updateMenu: async (menuData) => {
    const response = await api.put('/api/manager/menu', menuData);
    return response.data;
  }
};
