'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  profileId?: string;
  unreadNotifications?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // -----------------------------------------------------------------------
  // Fetch current user from /api/auth/me
  // -----------------------------------------------------------------------
  const fetchUser = useCallback(async (jwt: string): Promise<AuthUser | null> => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data.user ?? null;
    } catch {
      return null;
    }
  }, []);

  // -----------------------------------------------------------------------
  // On mount – rehydrate from localStorage
  // -----------------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = localStorage.getItem('tmc_token');
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        const currentUser = await fetchUser(storedToken);
        if (currentUser) {
          setToken(storedToken);
          setUser(currentUser);
        } else {
          // Token is invalid or expired – clear it
          localStorage.removeItem('tmc_token');
        }
      } catch {
        localStorage.removeItem('tmc_token');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [fetchUser]);

  // -----------------------------------------------------------------------
  // login
  // -----------------------------------------------------------------------
  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Tizimga kirishda xatolik yuz berdi");
      }

      const jwt = data.token as string;
      const authUser = data.user as AuthUser;

      localStorage.setItem('tmc_token', jwt);
      setToken(jwt);
      setUser(authUser);
    },
    [],
  );

  // -----------------------------------------------------------------------
  // register
  // -----------------------------------------------------------------------
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }

      const jwt = data.token as string;
      const authUser = data.user as AuthUser;

      localStorage.setItem('tmc_token', jwt);
      setToken(jwt);
      setUser(authUser);
    },
    [],
  );

  // -----------------------------------------------------------------------
  // logout
  // -----------------------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Even if the server call fails, clear local state
    }

    localStorage.removeItem('tmc_token');
    setToken(null);
    setUser(null);
    router.push('/');
  }, [router]);

  // -----------------------------------------------------------------------
  // refreshUser
  // -----------------------------------------------------------------------
  const refreshUser = useCallback(async () => {
    const storedToken = token || localStorage.getItem('tmc_token');
    if (!storedToken) return;

    const currentUser = await fetchUser(storedToken);
    if (currentUser) {
      setUser(currentUser);
    }
  }, [token, fetchUser]);

  // -----------------------------------------------------------------------
  // Memoised value
  // -----------------------------------------------------------------------
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
