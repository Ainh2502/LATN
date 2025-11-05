import axios from "axios";

// ⚙️ Ưu tiên biến môi trường, fallback về API chính thức trên EC2
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.latn.site", // ✅ Dùng domain HTTPS chính thức (có SSL)
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Cho phép gửi cookie/token cross-domain
});

// 🔐 Tự động gắn token từ localStorage vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚫 Nếu token hết hạn (401) → tự logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Token hết hạn hoặc không hợp lệ, tự động đăng xuất.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // ✅ Điều hướng đúng cho HashRouter
      window.location.hash = "#/login";
    }
    return Promise.reject(error);
  }
);


export default api;
