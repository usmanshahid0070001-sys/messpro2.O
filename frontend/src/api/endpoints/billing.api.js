import api from '../client';

export const billingApi = {
  generateBills: async (data) => {
    const response = await api.post('/api/billing/generate', data);
    return response.data;
  },

  getAllBills: async () => {
    const response = await api.get('/api/billing');
    return response.data;
  },
  
  payBill: async (billId) => {
    const response = await api.post(`/api/billing/${billId}/pay`);
    return response.data;
  },
  
  partialPayBill: async (billId, amount) => {
    const response = await api.post(`/api/billing/${billId}/partial-pay`, { amount });
    return response.data;
  },

  getMonthlyBill: async (month) => {
    const response = await api.get(`/api/billing/monthly?month=${month}`);
    return response.data;
  }
};
