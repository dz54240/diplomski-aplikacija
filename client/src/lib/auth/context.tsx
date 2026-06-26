import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '@/lib/api/users';
import { login as apiLogin, logout as apiLogout } from '@/lib/api/sessions';
import { registerUser as apiRegister, type RegisterInput } from '@/lib/api/users';
import { clearToken, readToken, writeToken } from './token';

interface AuthState {
  user: AuthUser | null;
  isAuthed: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

const USER_KEY = 'studai.auth.user';

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    readToken() ? readStoredUser() : null,
  );

  useEffect(() => {
    if (!readToken()) setUser(null);
  }, []);

  const value: AuthState = {
    user,
    isAuthed: !!user,
    isLoading: false,
    login: async (email, password) => {
      const { token, user } = await apiLogin({ email, password });
      writeToken(token);
      writeStoredUser(user);
      setUser(user);
    },
    register: async (input) => {
      const { token, user } = await apiRegister(input);
      writeToken(token);
      writeStoredUser(user);
      setUser(user);
    },
    logout: async () => {
      try {
        await apiLogout();
      } catch {
        // swallow — clear locally anyway
      }
      clearToken();
      writeStoredUser(null);
      setUser(null);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function isAuthed(): boolean {
  return !!readToken();
}
