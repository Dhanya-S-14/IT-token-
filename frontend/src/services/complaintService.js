import api from './api';

export const complaintService = {
  create: (data) => api.post('/complaints', data),
  getMy: (params) => api.get('/complaints/my', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  getByToken: (token) => api.get(`/complaints/token/${token}`),
  getAll: (params) => api.get('/complaints', { params }),
  assign: (id, data) => api.put(`/complaints/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
  getStats: () => api.get('/complaints/stats'),
  getEmployeeStats: () => api.get('/complaints/employee-stats'),
};
