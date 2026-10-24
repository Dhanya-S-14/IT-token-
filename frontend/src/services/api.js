import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach the auth token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // When sending FormData (file uploads), let axios set the correct
  // multipart/form-data Content-Type WITH the boundary. Manually forcing
  // "multipart/form-data" without a boundary makes multer fail to parse
  // the body, which causes a 500/validation "server error" on complaint
  // creation. Only override the header for plain JSON requests.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry && !error.config.url.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const isAdmin = window.location.pathname.startsWith('/admin');
      window.location.href = isAdmin ? '/login/admin' : '/login/employee';
    }
    return Promise.reject(error);
  }
);

export default api;
