import api from './api';

export const knowledgeService = {
  getAll: (params) => api.get('/knowledge', { params }),
  getById: (id) => api.get(`/knowledge/${id}`),
  create: (data) => api.post('/knowledge', data),
  update: (id, data) => api.put(`/knowledge/${id}`, data),
  delete: (id) => api.delete(`/knowledge/${id}`),
  toggleLike: (id) => api.post(`/knowledge/${id}/like`),
  toggleBookmark: (id) => api.post(`/knowledge/${id}/bookmark`),
  getBookmarks: () => api.get('/knowledge/bookmarks'),
};
