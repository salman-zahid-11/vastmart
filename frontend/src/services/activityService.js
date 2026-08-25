import api from './api';

export const trackActivity = async (productId, action) => {
  try {
    await api.post('/activity/track', { productId, action });
  } catch (err) {
    // Tracking must never break the user's actual experience
  }
};

export const getAbandonedActivity = async () => {
  const response = await api.get('/activity/abandoned');
  return response.data;
};