import api from './axios';

export const heroService = {
  // Public
  getActive: async () => {
    const response = await api.get('/hero/active');
    return response.data;
  },

  // Admin
  getAll: async () => {
    const response = await api.get('/hero');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/hero', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/hero/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/hero/${id}`);
    return response.data;
  },
  toggleActive: async (id) => {
    const response = await api.patch(`/hero/${id}/toggle`);
    return response.data;
  },
  uploadVideo: async (id, formData) => {
    const response = await api.post(`/hero/${id}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
