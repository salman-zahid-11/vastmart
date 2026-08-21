import api from './api';

export const getActiveNotices = async () => {
  const response = await api.get('/notices');
  return response.data;
};

export const getAllNotices = async () => {
  const response = await api.get('/notices/admin/all');
  return response.data;
};

export const createNotice = async (message) => {
  const response = await api.post('/notices', { message });
  return response.data;
};

export const toggleNotice = async (id) => {
  const response = await api.put(`/notices/${id}/toggle`);
  return response.data;
};

export const deleteNotice = async (id) => {
  const response = await api.delete(`/notices/${id}`);
  return response.data;
};