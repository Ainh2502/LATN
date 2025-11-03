import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

type User = { id: string; email: string; name?: string; role?: string };

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  getUserRole: () => string | null;
  setUser: (u: User | null) => void;
};

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // 🟢 thêm trạng thái chờ

  // 🟢 Khi mount -> đọc lại token/user & gắn vào axios
  useEffect(() => {
    const tk = localStorage.getItem('token');
    const u = localStorage.getItem('user');

    if (tk) {
      setToken(tk);
      api.defaults.headers.common['Authorization'] = `Bearer ${tk}`;
    }

    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem('user');
      }
    }

    // Đợi 1 chút để chắc chắn axios đã có token
    setTimeout(() => setLoading(false), 200);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login-client', { email, password });
    const tk = res.data.token;
    const usr = res.data.user;
    localStorage.setItem('token', tk);
    localStorage.setItem('user', JSON.stringify(usr));
    setToken(tk);
    setUser(usr);
    api.defaults.headers.common['Authorization'] = `Bearer ${tk}`;
  };

  const register = async (email: string, password: string, name?: string) => {
    await api.post('/auth/register', { email, password, name });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const getUserRole = () => {
    if (user?.role) return user.role;
    try {
      const u = localStorage.getItem('user');
      if (!u) return null;
      const parsed = JSON.parse(u);
      return parsed?.role || null;
    } catch {
      return null;
    }
  };

  // 🟡 Trong khi đang khôi phục session => chờ
  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;

  return (
    <Ctx.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        getUserRole,
        setUser,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
