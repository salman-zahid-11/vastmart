import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAllProductsAdmin = async () => {
  const response = await api.get('/products/admin/all');
  return response.data;
};

export const approveProduct = async (productId, isApproved) => {
  const response = await api.put(`/products/admin/${productId}/approve`, { isApproved });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await api.put(`/admin/users/${userId}/status`, { status });
  return response.data;
};

export const getAllOrdersAdmin = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const getActivityLog = async () => {
  const response = await api.get('/admin/activity');
  return response.data;
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  const response = await api.put(`/orders/${orderId}/status`, { orderStatus });
  return response.data;
};

export const updateAdminLevel = async (userId, role, adminLevel) => {
  const response = await api.put(`/admin/users/${userId}/admin-level`, { role, adminLevel });
  return response.data;
};
export const bulkApproveProducts = async (productIds, isApproved) => {
  const response = await api.put('/products/admin/bulk-approve', { productIds, isApproved });
  return response.data;
};

export const getSalesAnalytics = async (days = 30) => {
  const response = await api.get('/admin/analytics/sales', { params: { days } });
  return response.data;
};

export const getTopProducts = async () => {
  const response = await api.get('/admin/analytics/top-products');
  return response.data;
};

export const getTopSellers = async () => {
  const response = await api.get('/admin/analytics/top-sellers');
  return response.data;
};

export const getOrderStatusBreakdown = async () => {
  const response = await api.get('/admin/analytics/order-status');
  return response.data;
};