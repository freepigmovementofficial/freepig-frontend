import axiosInstance from './axios';

export const riderService = {
  // Public
  getAll: async (params) => {
    const response = await axiosInstance.get('/riders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/riders/${id}`);
    return response.data;
  },

  // Admin
  create: async (data) => {
    const response = await axiosInstance.post('/riders', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/riders/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/riders/${id}`);
    return response.data;
  },

  uploadImages: async (id, formData) => {
    const response = await axiosInstance.post(`/riders/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (id, imageId) => {
    const response = await axiosInstance.delete(`/riders/${id}/images/${imageId}`);
    return response.data;
  },

  uploadVideo: async (id, formData) => {
    const response = await axiosInstance.post(`/riders/${id}/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteVideo: async (id) => {
    const response = await axiosInstance.delete(`/riders/${id}/video`);
    return response.data;
  },
};
