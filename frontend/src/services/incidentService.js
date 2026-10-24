import api from './api';

export const incidentService = {
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
  assign: (id, data) => api.put(`/incidents/${id}/assign`, data),
  close: (id, data) => api.put(`/incidents/${id}/close`, data),
};
