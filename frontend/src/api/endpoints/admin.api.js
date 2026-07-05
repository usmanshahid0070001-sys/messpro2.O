import api from '../client';

export const adminApi = {
  getDashboardStats: async (month) => {
    const response = await api.get(`/api/admin/dashboard-stats?month=${month}`);
    return response.data;
  },
  
  getStudents: async () => {
    const response = await api.get('/api/admin/students');
    return response.data;
  },
  
  addStudent: async (studentData) => {
    const response = await api.post('/api/admin/students', studentData);
    return response.data;
  },
  
  deleteStudent: async (studentId) => {
    const response = await api.delete(`/api/admin/students/${studentId}`);
    return response.data;
  },
  
  bulkUploadStudents: async (formData) => {
    const response = await api.post('/api/admin/students/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  getMealSettings: async () => {
    const response = await api.get('/api/admin/meal-settings');
    return response.data;
  },
  
  updateMealSettings: async (settings) => {
    const response = await api.put('/api/admin/meal-settings', settings);
    return response.data;
  },
  
  getMenu: async () => {
    const response = await api.get('/api/admin/menu');
    return response.data;
  },
  
  generateBills: async (data) => {
    const response = await api.post('/api/admin/generate-bills', data);
    return response.data;
  }
};
