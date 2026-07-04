import api from '../client';

// ─── ADMIN API ENDPOINTS ─────────────────────────────────────────────────────

// --- Students ---
export const adminGetStudents = async () => {
  const response = await api.get('/api/admin/students');
  return response.data;
};

export const adminAddStudent = async (payload) => {
  const response = await api.post('/api/admin/addstudent', payload);
  return response.data;
};

export const adminBulkUploadStudents = async (formData) => {
  const response = await api.post('/api/admin/upload-students', formData);
  return response.data;
};

export const adminChangeStudentPassword = async (payload) => {
  const response = await api.post('/api/admin/student/change-password', payload);
  return response.data;
};

export const adminChangeAccommodation = async ({ rollNumber, accommodation }) => {
  const response = await api.put(`/api/admin/student/${rollNumber}/accommodation`, { accommodation });
  return response.data;
};

export const adminGetPendingBills = async (rollNumber) => {
  const response = await api.get(`/api/admin/student/${rollNumber}/pending-bills`);
  return response.data;
};

export const adminDeleteStudent = async (rollNumber) => {
  const response = await api.delete(`/api/admin/student/${rollNumber}`);
  return response.data;
};

// --- Attendance ---
export const adminUploadAttendance = async (formData) => {
  const response = await api.post('/api/admin/upload-attendance', formData);
  return response.data;
};

export const adminUploadAttendanceChunk = async (payload) => {
  const response = await api.post('/api/admin/upload-attendance-chunk', payload);
  return response.data;
};

export const adminGetMachineAttendanceCounts = async (month) => {
  const response = await api.get(`/api/admin/getMachineAttendenceCounts?month=${month}`);
  return response.data;
};

// --- Meal Prices ---
export const adminGetMealPrices = async (month) => {
  const response = await api.get(`/api/admin/getMachineMealPrices?month=${month}`);
  return response.data;
};

export const adminSaveMealPrices = async (payload) => {
  const response = await api.post('/api/admin/saveMachineMealPrices', payload);
  return response.data;
};

// --- Meal Settings ---
export const adminGetMealSettings = async () => {
  const response = await api.get('/api/admin/meal-settings');
  return response.data;
};

export const adminUpdateMealSettings = async (payload) => {
  const response = await api.put('/api/admin/meal-settings', payload);
  return response.data;
};

// --- Menu ---
export const adminGetMenu = async () => {
  const response = await api.get('/api/admin/get-menu');
  return response.data;
};

export const adminUpdateMenu = async (payload) => {
  const response = await api.post('/api/admin/update-menu', payload);
  return response.data;
};

export const adminGetMenuDefaults = async () => {
  const response = await api.get('/api/admin/menu-defaults');
  return response.data;
};

// --- Bills ---
export const adminGenerateBills = async (payload) => {
  const response = await api.post('/api/admin/generateBills', payload);
  return response.data;
};

export const adminUpdateSurcharges = async (payload) => {
  const response = await api.put('/api/admin/update-surcharges', payload);
  return response.data;
};

export const adminAdjustBill = async ({ billId, payload }) => {
  const response = await api.put(`/api/admin/bill/${billId}/adjust`, payload);
  return response.data;
};

export const adminGetBillSummary = async (month) => {
  const response = await api.get(`/api/admin/bill-summary?month=${month}`);
  return response.data;
};

// --- Dashboard Stats ---
export const adminGetDashboardStats = async (month) => {
  const response = await api.get(`/api/admin/dashboard-stats?month=${month}`);
  return response.data;
};

// --- Violations ---
export const adminGetMealViolations = async (month) => {
  const response = await api.get(`/api/admin/meal-violations?month=${month}`);
  return response.data;
};

export const adminApplyViolationFines = async (payload) => {
  const response = await api.post('/api/admin/apply-violation-fines', payload);
  return response.data;
};
