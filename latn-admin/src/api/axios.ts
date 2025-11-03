import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // ⚙️ Backend đang chạy local
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ✅ Gắn token tự động vào tất cả request (nếu có)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Nếu backend trả về 401 (token hết hạn hoặc không hợp lệ) → tự logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token hết hạn hoặc không hợp lệ. Tự động đăng xuất.');
      localStorage.removeItem('token');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

export default api;
