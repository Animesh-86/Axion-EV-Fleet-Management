import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
  company?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loginAsync: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupAsync: (name: string, email: string, password: string, company?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_USER: User = {
  name: 'Fleet Operator',
  email: 'operator@axion.sys',
  company: 'Axion Fleet Systems',
  role: 'ADMIN'
};

const USER_KEY = 'axion_user';
const TOKEN_KEY = 'axion_token';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, [user]);

  const loginAsync = async (email: string, password: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      if (!res.ok) return { success: false, error: 'Invalid credentials' };
      
      const data = await res.json();
      if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
      setUser({ name: data.username, email: data.username, role: data.role || 'ADMIN' });
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  };

  const signupAsync = async (name: string, email: string, password: string, company?: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password, role: 'OPERATOR' })
      });
      if (!res.ok) return { success: false, error: 'Registration failed or email already in use' };
      
      const data = await res.json();
      if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
      setUser({ name: data.username, email: data.username, company, role: data.role || 'OPERATOR' });
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginAsync,
      signupAsync,
      logout: () => {
        setUser(DEFAULT_USER);
        localStorage.removeItem(TOKEN_KEY);
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
