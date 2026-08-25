import api from './api';

export const validateCoupon = async (code, orderTotal) => {
  const response = await api.post('/coupons/validate', { code, orderTotal });
  return response.data;
};

export const getAllCoupons = async () => {
  const response = await api.get('/coupons');
  return response.data;
};

export const createCoupon = async (couponData) => {
  const response = await api.post('/coupons', couponData);
  return response.data;
};

export const toggleCoupon = async (id) => {
  const response = await api.put(`/coupons/${id}/toggle`);
  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};