import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  loginAsync: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupAsync: (name: string, email: string, password: string, company?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = 'axion_user';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    name: 'Admin User',
    email: 'admin@axion.local',
    company: 'Axion Corp'
  });

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
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
      // Server sets HttpOnly cookie with JWT; do not store token in localStorage.
      setUser({ name: data.username, email: data.username });
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
      // Server sets HttpOnly cookie with JWT; do not store token in localStorage.
      setUser({ name: data.username, email: data.username, company });
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginAsync, signupAsync, logout: () => { window.location.href = '/'; } }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
