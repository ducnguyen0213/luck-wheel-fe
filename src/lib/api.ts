import axios from 'axios';

// Sử dụng API URL từ biến môi trường hoặc sử dụng mặc định nếu không có
const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API URL đang sử dụng:', API_URL);

// Biến để theo dõi nếu refresh token đang được xử lý
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Tạo instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thời gian timeout 10s
  withCredentials: true, // Quan trọng: cho phép gửi cookies trong CORS requests
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

// Thêm interceptor phản hồi để bắt lỗi và xử lý token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Xử lý token hết hạn (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Nếu đang refresh token rồi, chờ đến khi hoàn thành
      if (isRefreshing) {
        try {
          await refreshPromise;
          // Thử lại request với token mới
          const token = localStorage.getItem('token');
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      
      // Bắt đầu quá trình refresh token
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
      
      try {
        await refreshPromise;
        // Thử lại request với token mới
        const token = localStorage.getItem('token');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token thất bại, đăng xuất người dùng
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Chuyển hướng đến trang đăng nhập nếu cần
          window.location.href = '/admin';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Nếu lỗi là do mạng hoặc timeout
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Lỗi kết nối: Không thể liên lạc với server API');
    } else {
      console.error('Lỗi API:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

// Hàm để refresh access token
export const refreshAccessToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
      withCredentials: true // Quan trọng: cho phép gửi cookies
    });
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    } else {
      throw new Error('Không thể làm mới token');
    }
  } catch (error) {
    console.error('Lỗi khi refresh token:', error);
    // Xóa token hiện tại vì không thể làm mới
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    throw error;
  }
};

// Auth APIs
export const loginAdmin = async (credentials: { email: string; password: string }) => {
  try {
    return await api.post('/auth/login', credentials);
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw error;
  }
};

export const logoutAdmin = async () => {
  try {
    return await api.post('/auth/logout');
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
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
export const getPublicPrizes = async (page?: number, limit?: number) => {
  return api.get('/prizes', { params: { page, limit } });
};

export const getPrizeById = async (id: string) => {
  return api.get(`/prizes/${id}`);
};

export const getAllPrizes = async (page?: number, limit?: number) => {
  return api.get('/prizes/admin/all', { params: { page, limit } });
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

export const getAllUsers = async (page?: number, limit?: number) => {
  return api.get('/users', { params: { page, limit } });
};

export const getUserById = async (id: string) => {
  return api.get(`/users/${id}`);
};

export const exportUsers = async (page?: number, limit?: number) => {
  return api.get('/users/export', { params: { page, limit } });
};

// Spin APIs
export const spinWheel = async (userId: string) => {
  return api.post('/spins', { userId });
};

export const getUserSpins = async (userId: string, page?: number, limit?: number) => {
  return api.get(`/spins/user/${userId}`, { params: { page, limit } });
};

export const getAllSpins = async (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
  return api.get('/spins', { params });
};

export const getSpinStats = async (params?: { startDate?: string; endDate?: string }) => {
  return api.get('/spins/stats', { params });
};

export default api; 