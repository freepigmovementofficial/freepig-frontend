import api from './axios';

export const storeReviewService = {
  // Public (optional auth) — get all store reviews with avgRating, totalReviews, hasReviewed
  getAll: async (params = {}) => {
    const response = await api.get('/store-reviews', { params });
    return response.data;
  },

  // USER or ADMIN — submit a store review (only once per user)
  create: async (data) => {
    const response = await api.post('/store-reviews', data);
    return response.data;
  },

  // USER or ADMIN — update own review
  update: async (id, data) => {
    const response = await api.put(`/store-reviews/${id}`, data);
    return response.data;
  },

  // USER or ADMIN — delete own review (admin can delete any)
  delete: async (id) => {
    const response = await api.delete(`/store-reviews/${id}`);
    return response.data;
  },
};
