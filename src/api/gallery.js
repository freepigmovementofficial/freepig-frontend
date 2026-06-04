import axiosInstance from './axios';

export const galleryService = {
  // GET /gallery?page=1&limit=12
  getAll: async (params) => {
    return await axiosInstance.get('/gallery', { params });
  },

  // POST /gallery (multipart/form-data)
  upload: async (formData) => {
    return await axiosInstance.post('/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // PATCH /gallery/:id { caption: string | null }
  updateCaption: async (id, data) => {
    return await axiosInstance.patch(`/gallery/${id}`, data);
  },

  // DELETE /gallery/:id
  delete: async (id) => {
    return await axiosInstance.delete(`/gallery/${id}`);
  },
};
