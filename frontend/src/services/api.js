import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the logged-in user's token to every request, if available
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('userInfo');
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// An expired or invalid token must not leave the app in a broken authenticated
// state; clear it and let the user sign in again.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default api;