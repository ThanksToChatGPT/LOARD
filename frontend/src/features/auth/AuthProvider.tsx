import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, clearTokens, hasSession, login, logout } from '../../lib/api';
import type { User } from '../../lib/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  async function reload() {
    setLoading(true);
    setError('');
    if (!hasSession()) { setUser(null); setLoading(false); return; }
    try { setUser(await api<User>('/auth/me/')); }
    catch (failure) {
      if (failure instanceof Error && 'status' in failure && failure.status !== 401) setError(failure.message);
      setUser(null);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    void reload();
    const expire = () => { setUser(null); queryClient.clear(); };
    window.addEventListener('loard-session-expired', expire);
    return () => window.removeEventListener('loard-session-expired', expire);
  }, [queryClient]);

  async function signIn(email: string, password: string) {
    await login(email, password);
    try { setUser(await api<User>('/auth/me/')); }
    catch (failure) { clearTokens(); throw failure; }
  }

  async function signOut() {
    try { await logout(); }
    finally { queryClient.clear(); setUser(null); }
  }

  return <AuthContext.Provider value={{ user, loading, error, reload, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider es obligatorio.');
  return context;
}
