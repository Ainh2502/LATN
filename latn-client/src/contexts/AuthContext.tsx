import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

type User = { id: string; email: string; name?: string; role?: string };

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User | null) => void;
};

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;

  return (
    <Ctx.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </Ctx.Provider>
  );
}
