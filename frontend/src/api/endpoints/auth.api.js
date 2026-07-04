import api from '../client';

// ─── AUTH API ENDPOINTS ──────────────────────────────────────────────────────

export const authLogin = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const authLogout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

export const authVerify = async () => {
  const response = await api.get('/api/auth/verify');
  return response.data;
};
