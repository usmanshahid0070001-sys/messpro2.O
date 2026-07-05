import api from '../client';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/api/auth/verify');
    return response.data;
  }
};
