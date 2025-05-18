import axios from 'axios';

// Sử dụng API URL từ biến môi trường hoặc sử dụng mặc định nếu không có
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lucky-wheel-cicl.onrender.com/api';
console.log('API URL đang sử dụng:', API_URL);


// Tạo instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thời gian timeout 10s
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
    console.error('Lỗi khi gửi request API:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor phản hồi để bắt lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu lỗi là do mạng hoặc timeout
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Lỗi kết nối: Không thể liên lạc với server API');
    } else {
      console.error('Lỗi API:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);


// Auth APIs
export const loginAdmin = async (credentials: { email: string; password: string }) => {
  try {
    return await api.post('/auth/login', credentials);
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw error;
  }
};

export const getAdminProfile = async () => {
  try {
    return await api.get('/auth/me');
  } catch (error) {
    console.error('Lỗi lấy thông tin profile:', error);
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
export const checkUser = async (userData: { email: string; phone: string; address?: string; codeShop?: string }) => {
  return api.post('/users/check', userData);
};

export const createOrUpdateUser = async (userData: { name: string; email: string; phone: string; address: string; codeShop: string }) => {
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