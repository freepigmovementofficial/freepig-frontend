import api from './axios';

export const reviewService = {
  // Public: get latest reviews for homepage
  getLatest: async (params) => {
    const response = await api.get('/reviews/latest', { params });
    return response.data;
  },
  // Public: get reviews for a specific product
  getByProduct: async (productId, params) => {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },
  // Authenticated: create review
  create: async (productId, data) => {
    const response = await api.post(`/products/${productId}/reviews`, data);
    return response.data;
  },
  // Authenticated: update review
  update: async (reviewId, data) => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },
  // Authenticated: delete review
  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};
