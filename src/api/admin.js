import api from './axios';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getCustomOrders: async (params) => {
    const response = await api.get('/admin/custom-orders', { params });
    return response.data;
  },
  updateCustomOrderStatus: async (id, status) => {
    const response = await api.patch(`/admin/custom-orders/${id}/status`, { status });
    return response.data;
  },
  getReviews: async (params) => {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  },
  deleteReview: async (id) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  },
};
