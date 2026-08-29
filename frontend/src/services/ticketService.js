import api from './api';

export const createTicket = async (data) => {
  const response = await api.post('/tickets', data);
  return response.data;
};

export const getMyTickets = async () => {
  const response = await api.get('/tickets/my-tickets');
  return response.data;
};

export const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const addTicketMessage = async (id, message) => {
  const response = await api.post(`/tickets/${id}/messages`, { message });
  return response.data;
};

export const getAllTickets = async (status) => {
  const response = await api.get('/tickets', { params: status ? { status } : {} });
  return response.data;
};

export const updateTicket = async (id, data) => {
  const response = await api.put(`/tickets/${id}`, data);
  return response.data;
};