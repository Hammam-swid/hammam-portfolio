import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, setUnauthorizedHandler, tokenStore } from "./api";

interface AuthState {
  user: string | null;
  checking: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(() => !!tokenStore.get());

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) return;
    api
      .get<{ username: string }>("/auth/me")
      .then((r) => setUser(r.data.username))
      .catch(logout)
      .finally(() => setChecking(false));
  }, [logout]);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post<{ token: string; username: string }>("/auth/login", {
      username,
      password,
    });
    tokenStore.set(data.token);
    setUser(data.username);
  }, []);

  const value = useMemo(() => ({ user, checking, login, logout }), [user, checking, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div className="grid min-h-screen place-items-center text-muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
