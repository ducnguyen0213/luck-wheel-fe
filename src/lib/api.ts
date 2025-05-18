import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header nếu có
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor phản hồi để bắt lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API response error:', error);
    return Promise.reject(error);
  }
);

// Auth APIs
export const loginAdmin = async (credentials: { email: string; password: string }) => {
  try {
    return await api.post('/auth/login', credentials);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getAdminProfile = async () => {
  try {
    return await api.get('/auth/me');
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const registerAdmin = async (adminData: { name: string; email: string; password: string }) => {
  return api.post('/auth/register', adminData);
};

// Prize APIs
export const getPublicPrizes = async () => {
  return api.get('/prizes');
};

export const getPrizeById = async (id: string) => {
  return api.get(`/prizes/${id}`);
};

export const getAllPrizes = async () => {
  return api.get('/prizes/admin/all');
};

export const createPrize = async (prizeData: any) => {
  return api.post('/prizes', prizeData);
};

export const updatePrize = async (id: string, prizeData: any) => {
  return api.put(`/prizes/${id}`, prizeData);
};

export const deletePrize = async (id: string) => {
  return api.delete(`/prizes/${id}`);
};

// User APIs
export const checkUser = async (userData: { email: string; phone: string; codeShop?: string }) => {
  return api.post('/users/check', userData);
};

export const createOrUpdateUser = async (userData: { name: string; email: string; phone: string; codeShop: string }) => {
  return api.post('/users', userData);
};

export const getAllUsers = async () => {
  return api.get('/users');
};

export const getUserById = async (id: string) => {
  return api.get(`/users/${id}`);
};

export const exportUsers = async () => {
  return api.get('/users/export');
};

// Spin APIs
export const spinWheel = async (userId: string) => {
  return api.post('/spins', { userId });
};

export const getUserSpins = async (userId: string) => {
  return api.get(`/spins/user/${userId}`);
};

export const getAllSpins = async (params?: { startDate?: string; endDate?: string }) => {
  return api.get('/spins', { params });
};

export const getSpinStats = async (params?: { startDate?: string; endDate?: string }) => {
  return api.get('/spins/stats', { params });
};

export default api; 