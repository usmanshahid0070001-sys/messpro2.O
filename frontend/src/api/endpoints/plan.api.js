import api from '../client';

export const planApi = {
  getPlans: async () => {
    const response = await api.get('/api/plans');
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post('/api/plans', planData);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await api.patch(`/api/plans/${id}`, planData);
    return response.data;
  }
};
