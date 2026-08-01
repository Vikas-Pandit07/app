import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loginUser, logoutUser, registerUser, toAuthUser, verifyAuth } from '../api/authService';
import type { AuthUser, LoginPayload, RegisterPayload } from '../lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const data = await verifyAuth();
      if (data.authenticated) {
        setUser(toAuthUser(data));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    await loginUser(payload);
    await refreshAuth();
  };

  const register = async (payload: RegisterPayload) => {
    await registerUser(payload);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role?.toUpperCase() === 'ADMIN',
      loading,
      login,
      register,
      logout,
      refreshAuth,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
