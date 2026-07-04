import api from '../client';

// ─── MANAGER API ENDPOINTS ───────────────────────────────────────────────────

// --- Menu ---
export const managerGetMenu = async () => {
  const response = await api.get('/api/manager/get-menu');
  return response.data;
};

export const managerUpdateMenu = async (payload) => {
  const response = await api.post('/api/manager/update-menu', payload);
  return response.data;
};

// --- Daily Counts ---
export const managerGetDailyCounts = async (date) => {
  const response = await api.get(`/api/manager/daily-counts?date=${date}`);
  return response.data;
};

// --- Bills ---
export const managerGetStudentBill = async (rollNumber) => {
  const response = await api.get(`/api/manager/student-bill/${rollNumber}`);
  return response.data;
};

export const managerPayBill = async (billId) => {
  const response = await api.put(`/api/manager/pay-bill/${billId}`);
  return response.data;
};

export const managerPartiallyPayBill = async ({ billId, payload }) => {
  const response = await api.put(`/api/manager/pay-bill/${billId}/partial`, payload);
  return response.data;
};

export const managerGetAllBills = async () => {
  const response = await api.get('/api/manager/all-bills');
  return response.data;
};
