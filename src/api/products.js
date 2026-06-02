import api from './axios';

export const productService = {
  getAll: async (params, config = {}) => {
    const response = await api.get('/products', { params, ...config });
    return response.data;
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  uploadImages: async (id, formData) => {
    const response = await api.post(`/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteImage: async (id, imageId) => {
    const response = await api.delete(`/products/${id}/images/${imageId}`);
    return response.data;
  },
  setPrimaryImage: async (id, imageId) => {
    const response = await api.patch(`/products/${id}/images/${imageId}/primary`);
    return response.data;
  },
};
