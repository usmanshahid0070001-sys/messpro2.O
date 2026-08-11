import api from'../client';

export const residenceApi = {
 getRooms: async () => {
 const response = await api.get('/api/residence');
 return response.data;
 },

 addRoom: async (roomData) => {
 const response = await api.post('/api/residence', roomData);
 return response.data;
 },

 removeRoom: async (id) => {
 const response = await api.delete(`/api/residence/${id}`);
 return response.data;
 },

 assignRoom: async (allocationData) => {
 const response = await api.post('/api/residence/allote', allocationData);
 return response.data;
 },

 removeStudentFromRoom: async (disallocationData) => {
 const response = await api.post('/api/residence/disallote', disallocationData);
 return response.data;
 },

 swapRoom: async (swapData) => {
 const response = await api.post('/api/residence/change', swapData);
 return response.data;
 },

 getMyRoom: async () => {
 const response = await api.get('/api/residence/my-room');
 return response.data;
 },

 markRoomCleaning: async () => {
 const response = await api.post('/api/residence/my-room/cleaning');
 return response.data;
 }
};
