import api from '../client';

export const userApi = {
  getUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.patch(`/api/users/${id}`, userData);
    return response.data;
  },

  addStudent: async (studentData) => {
    const response = await api.post('/api/users/add', studentData);
    return response.data;
  },
  
  deleteStudent: async (studentId) => {
    const response = await api.delete(`/api/users/${studentId}`);
    return response.data;
  },
  
  bulkUploadStudents: async (formData) => {
    const response = await api.post('/api/users/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
