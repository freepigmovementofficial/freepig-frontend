import axiosInstance from './axios';

export const testimonialsService = {
  // GET /testimonials?page=1&limit=12 (public, active only)
  getAll: async (params) => {
    return await axiosInstance.get('/testimonials', { params });
  },

  // GET /testimonials/all (admin only)
  getAllAdmin: async (params) => {
    return await axiosInstance.get('/testimonials/all', { params });
  },

  // POST /testimonials (admin only)
  create: async (data) => {
    return await axiosInstance.post('/testimonials', data);
  },

  // PUT /testimonials/:id (admin only)
  update: async (id, data) => {
    return await axiosInstance.put(`/testimonials/${id}`, data);
  },

  // DELETE /testimonials/:id (admin only)
  delete: async (id) => {
    return await axiosInstance.delete(`/testimonials/${id}`);
  },

  // POST /testimonials/:id/photo (admin only, multipart/form-data)
  uploadPhoto: async (id, formData) => {
    return await axiosInstance.post(`/testimonials/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // PATCH /testimonials/:id/toggle (admin only)
  toggle: async (id) => {
    return await axiosInstance.patch(`/testimonials/${id}/toggle`);
  },
};
