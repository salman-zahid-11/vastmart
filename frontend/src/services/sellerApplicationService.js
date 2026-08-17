import api from './api';

export const submitApplication = async (formData) => {
  const response = await api.post('/seller-applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMyApplication = async () => {
  const response = await api.get('/seller-applications/my-application');
  return response.data;
};

export const getAllApplications = async (status) => {
  const response = await api.get('/seller-applications', { params: status ? { status } : {} });
  return response.data;
};

export const reviewApplication = async (id, decision, rejectionReason) => {
  const response = await api.put(`/seller-applications/${id}/review`, { decision, rejectionReason });
  return response.data;
};