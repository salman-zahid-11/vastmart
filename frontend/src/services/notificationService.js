import api from './api';

export const getMyNotifications = async () => {
  const response = await api.get('/notifications/mine');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const createNotification = async (payload) => {
  const response = await api.post('/notifications', payload);
  return response.data;
};
