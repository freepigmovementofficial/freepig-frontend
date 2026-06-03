import api from './axios';

export const featuredService = {
  // Public — get active featured section with its products
  getActive: async () => {
    const response = await api.get('/featured/active');
    return response.data;
  },

  // Admin — list all featured sections
  getAll: async () => {
    const response = await api.get('/featured');
    return response.data;
  },

  // Admin — create a new featured section
  create: async (data) => {
    const response = await api.post('/featured', data);
    return response.data;
  },

  // Admin — update featured section title
  update: async (id, data) => {
    const response = await api.put(`/featured/${id}`, data);
    return response.data;
  },

  // Admin — delete a featured section
  delete: async (id) => {
    const response = await api.delete(`/featured/${id}`);
    return response.data;
  },

  // Admin — replace entire product list of a featured section
  setProducts: async (id, productIds) => {
    const response = await api.post(`/featured/${id}/products`, { productIds });
    return response.data;
  },

  // Admin — remove a single product from a featured section
  removeProduct: async (id, productId) => {
    const response = await api.delete(`/featured/${id}/products/${productId}`);
    return response.data;
  },

  // Admin — toggle isActive status of a featured section
  toggleActive: async (id) => {
    const response = await api.patch(`/featured/${id}/toggle`);
    return response.data;
  },
};
