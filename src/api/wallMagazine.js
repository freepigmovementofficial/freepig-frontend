import api from './axios';

export const wallMagazineService = {
  // Public
  getActive: async () => {
    const response = await api.get('/wall-magazine/active');
    return response.data;
  },

  // Admin
  getAll: async () => {
    const response = await api.get('/wall-magazine');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/wall-magazine', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/wall-magazine/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/wall-magazine/${id}`);
    return response.data;
  },
  toggleActive: async (id) => {
    const response = await api.patch(`/wall-magazine/${id}/toggle`);
    return response.data;
  },
  uploadImage: async (id, formData) => {
    const response = await api.post(`/wall-magazine/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
