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

// Keep the locally stored session intact for ordinary API failures. The server
// remains responsible for rejecting expired or terminated accounts.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (
      (error.response?.status === 401 && message === 'User not found')
      || (error.response?.status === 401 && message === 'Session invalidated. Please log in again.')
      || (error.response?.status === 403 && typeof message === 'string' && message.startsWith('Account is '))
    ) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default api;