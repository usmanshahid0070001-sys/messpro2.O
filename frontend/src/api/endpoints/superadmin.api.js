import api from '../client';

export const superadminApi = {
  getHostels: async () => {
    const response = await api.get('/api/hostels');
    return response.data;
  },

  createHostel: async (hostelData) => {
    const response = await api.post('/api/hostels', hostelData);
    return response.data;
  },

  updateHostelSettings: async (id, settingsData) => {
    const response = await api.patch(`/api/hostels/${id}/settings`, settingsData);
    return response.data;
  }
};
