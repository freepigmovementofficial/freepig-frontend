import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Exclude login & verify-otp: a 401 there just means wrong credentials,
    // not an expired session. The component will handle showing the error.
    const url = error.config?.url || '';
    const isLoginOrOtp = url.includes('/auth/login') || url.includes('/auth/verify-otp');
    if (error.response && error.response.status === 401 && !isLoginOrOtp) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;
