import api from './api';

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getMonthlyTrends: (params) => api.get('/analytics/monthly-trends', { params }),
  getEngineerPerformance: () => api.get('/analytics/engineer-performance'),
  getExport: (type) => api.get(`/analytics/export/${type}`),
};
