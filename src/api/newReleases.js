import api from './axios';

export const newReleaseService = {
  getActive: async () => {
    const response = await api.get('/new-releases/active');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/new-releases');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/new-releases', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/new-releases/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/new-releases/${id}`);
    return response.data;
  },
  toggleActive: async (id) => {
    const response = await api.patch(`/new-releases/${id}/toggle`);
    return response.data;
  },
  uploadVideo: async (id, formData) => {
    const response = await api.post(`/new-releases/${id}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  uploadImages: async (id, formData) => {
    const response = await api.post(`/new-releases/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteImage: async (id, imageId) => {
    const response = await api.delete(`/new-releases/${id}/images/${imageId}`);
    return response.data;
  },
};
