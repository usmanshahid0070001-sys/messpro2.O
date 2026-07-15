import api from '../client';

export const hostelApi = {
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
  },

  addHostelUser: async (id, userData) => {
    const response = await api.post(`/api/hostels/${id}/users`, userData);
    return response.data;
  },

  getMyHostel: async () => {
    const response = await api.get('/api/hostels/my-hostel');
    return response.data;
  },

  updateMyHostelSettings: async (settingsData) => {
    const response = await api.patch('/api/hostels/my-hostel/settings', settingsData);
    return response.data;
  }
};
