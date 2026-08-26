import api from './api';

export const getActiveCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getAllCategories = async () => {
  const response = await api.get('/categories/admin/all');
  return response.data;
};

export const createCategory = async (name, subCategories = []) => {
  const response = await api.post('/categories', { name, subCategories });
  return response.data;
};

export const addSubCategory = async (categoryId, subCategory) => {
  const response = await api.post(`/categories/${categoryId}/subcategories`, { subCategory });
  return response.data;
};

export const removeSubCategory = async (categoryId, subCategory) => {
  const response = await api.delete(`/categories/${categoryId}/subcategories/${encodeURIComponent(subCategory)}`);
  return response.data;
};

export const toggleCategory = async (id) => {
  const response = await api.put(`/categories/${id}/toggle`);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};