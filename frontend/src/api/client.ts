import axios from 'axios';

const apiHost = import.meta.env.VITE_API_HOST;
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (apiHost ? `https://${apiHost}/api` : '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('carebridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login page, redirect to login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/' && currentPath !== '/register') {
        localStorage.removeItem('carebridge_token');
        localStorage.removeItem('carebridge_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
