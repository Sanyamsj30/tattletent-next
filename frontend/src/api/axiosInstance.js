import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/api/auth/login')) {
        console.warn('Unauthorized request - redirecting to login...');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
