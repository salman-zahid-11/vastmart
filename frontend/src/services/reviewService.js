import api from './api';

export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const getAllReviewsAdmin = async () => {
  const response = await api.get('/reviews/admin/all');
  return response.data;
};

export const createReview = async (review) => {
  const response = await api.post('/reviews', review);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  await api.delete(`/reviews/${reviewId}`);
};
