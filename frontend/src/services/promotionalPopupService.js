import api from './api';

export const getActivePopup = async () => (await api.get('/promotional-popups')).data;
export const getAllPopups = async () => (await api.get('/promotional-popups/admin/all')).data;
export const createPopup = async (data) => (await api.post('/promotional-popups', data, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
export const updatePopup = async (id, data) => (await api.put(`/promotional-popups/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
export const togglePopup = async (id) => (await api.put(`/promotional-popups/${id}/toggle`)).data;
export const deletePopup = async (id) => (await api.delete(`/promotional-popups/${id}`)).data;
