import api from './api';

export const authService = {
  adminLogin: (data) => api.post('/auth/admin/login', data),
  employeeLogin: (data) => api.post('/auth/employee/login', data),
  employeeRegister: (data) => api.post('/auth/employee/register', data),
};
