import api from '../client';

// ─── STUDENT API ENDPOINTS ───────────────────────────────────────────────────

// --- Meal Timings ---
export const studentGetMealTimings = async () => {
  const response = await api.get('/api/student/meal-timings');
  return response.data;
};

// --- Weekly Selections ---
export const studentGetWeeklySelections = async (dates) => {
  const response = await api.get(`/api/student/weekly-selections?dates=${dates}`);
  return response.data;
};

export const studentUpdateSelections = async (payload) => {
  const response = await api.post('/api/student/update-selections', payload);
  return response.data;
};

// --- History ---
export const studentGetHistory = async ({ year, month }) => {
  const response = await api.get(`/api/student/history?year=${year}&month=${month}`);
  return response.data;
};

// --- Bills ---
export const studentGetMonthlyBill = async (month) => {
  const response = await api.get(`/api/student/monthly-bill?month=${month}`);
  return response.data;
};

// --- Menu Schedule ---
export const studentGetMealSchedule = async () => {
  const response = await api.get('/api/student/getmealschedule');
  return response.data;
};
