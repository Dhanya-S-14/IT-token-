import api from './api';

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile/update', data),
  updateProfilePicture: (data) => api.put('/users/profile/picture', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
