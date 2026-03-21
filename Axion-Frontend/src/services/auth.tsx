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
const ACCOUNTS_KEY = 'axion_accounts';

interface StoredAccount {
  name: string;
  email: string;
  passwordHash: string;
  company?: string;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); }
  catch { return []; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(USER_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const loginAsync = async (email: string, password: string) => {
    const accounts = getAccounts();
    const account = accounts.find(a => a.email === email.toLowerCase().trim());
    if (!account) return { success: false, error: 'No account found with this email' };

    const hash = await hashPassword(password);
    if (hash !== account.passwordHash) return { success: false, error: 'Incorrect password' };

    setUser({ name: account.name, email: account.email, company: account.company });
    return { success: true };
  };

  const signupAsync = async (name: string, email: string, password: string, company?: string) => {
    const accounts = getAccounts();
    const normalized = email.toLowerCase().trim();
    if (accounts.find(a => a.email === normalized))
      return { success: false, error: 'An account with this email already exists' };

    const hash = await hashPassword(password);
    const trimmedCompany = company?.trim() || undefined;
    accounts.push({ name: name.trim(), email: normalized, passwordHash: hash, company: trimmedCompany });
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

    setUser({ name: name.trim(), email: normalized, company: trimmedCompany });
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, loginAsync, signupAsync, logout: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
