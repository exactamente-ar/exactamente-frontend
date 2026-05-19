import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { PublicUser, AuthState } from '../types/auth';
import { getMe } from '@/shared/services/api';

const STORAGE_KEY = 'exactamente_auth';

interface AuthContextValue extends AuthState {
  login: (user: PublicUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as { user: PublicUser; token: string };
      getMe(parsed.token).then((result) => {
        if (result.error) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          setUser(result.data);
          setToken(parsed.token);
        }
        setLoading(false);
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
    }
  }, []);

  const login = (user: PublicUser, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider');
  return ctx;
}
