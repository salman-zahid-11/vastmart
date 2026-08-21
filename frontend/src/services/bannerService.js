import api from './api';

export const getActiveBanners = async () => {
  const response = await api.get('/banners');
  return response.data;
};

export const getAllBanners = async () => {
  const response = await api.get('/banners/admin/all');
  return response.data;
};

export const createBanner = async (formData) => {
  const response = await api.post('/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const toggleBanner = async (id) => {
  const response = await api.put(`/banners/${id}/toggle`);
  return response.data;
};

export const deleteBanner = async (id) => {
  const response = await api.delete(`/banners/${id}`);
  return response.data;
};