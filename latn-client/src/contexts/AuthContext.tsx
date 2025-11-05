import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

// 🧩 Kiểu dữ liệu người dùng
type User = { id: string; email: string; name?: string; role?: string };

// 🧱 Kiểu context xác thực
type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User | null) => void;
  getUserRole: () => string | null; // ✅ Thêm dòng này
};

// 🔧 Tạo Context
const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

// ⚙️ Provider cho toàn ứng dụng
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Kiểm tra token và user khi load app
  useEffect(() => {
    const tk = localStorage.getItem("token");
    const u = localStorage.getItem("user");

    if (tk) {
      setToken(tk);
      api.defaults.headers.common["Authorization"] = `Bearer ${tk}`;
    }

    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setTimeout(() => setLoading(false), 150);
  }, []);

  // 🔑 Hàm đăng nhập
  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login-client", { email, password });
    const tk = res.data.token;
    const usr = res.data.user;

    localStorage.setItem("token", tk);
    localStorage.setItem("user", JSON.stringify(usr));

    setToken(tk);
    setUser(usr);
    api.defaults.headers.common["Authorization"] = `Bearer ${tk}`;
  };

  // 🚪 Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  // 🧠 Hàm lấy vai trò người dùng
  const getUserRole = () => user?.role || null;

  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;

  // ✅ Trả context ra cho toàn app
  return (
    <Ctx.Provider
      value={{ user, token, loading, login, logout, setUser, getUserRole }}
    >
      {children}
    </Ctx.Provider>
  );
}
