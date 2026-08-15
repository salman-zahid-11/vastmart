import api from './api';

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const verifyResetCode = async (email, code) => {
  const response = await api.post('/auth/verify-reset-code', { email, code });
  return response.data;
};

export const resetPassword = async (email, code, newPassword) => {
  const response = await api.post('/auth/reset-password', { email, code, newPassword });
  return response.data;
};