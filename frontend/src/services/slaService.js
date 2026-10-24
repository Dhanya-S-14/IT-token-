import api from './api';

export const slaService = {
  getAll: (params) => api.get('/sla', { params }),
  getByIncident: (incidentId) => api.get(`/sla/${incidentId}`),
  getSummary: () => api.get('/sla/summary'),
};
