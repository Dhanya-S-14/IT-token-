import api from './api';

export const changeService = {
  getAll: (params) => api.get('/changes', { params }),
  getById: (id) => api.get(`/changes/${id}`),
  create: (data) => api.post('/changes', data),
  update: (id, data) => api.put(`/changes/${id}`, data),
  approve: (id, data) => api.put(`/changes/${id}/approve`, data),
  reject: (id, data) => api.put(`/changes/${id}/reject`, data),
};
