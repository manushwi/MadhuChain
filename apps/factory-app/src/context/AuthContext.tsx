import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_STORAGE_KEY } from '@/constants/api';
import { ApiError, setUnauthorizedHandler } from '@/src/api/client';
import { login as apiLogin, me as apiMe } from '@/src/api/auth';
import { clearBatchMemoryCache } from '@/src/api/batches';
import type { AuthUser } from '@/src/api/types';

type AuthStatus = 'boot' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (p: { email?: string; phone?: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('boot');

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY).catch(() => undefined);
    const keys = await AsyncStorage.getAllKeys().catch(() => []);
    await AsyncStorage.multiRemove(keys.filter((key) => key.startsWith('hc.factory.'))).catch(() => undefined);
    clearBatchMemoryCache();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const persist = useCallback(async (auth: { token: string; user: AuthUser }) => {
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, auth.token);
    setUser(auth.user);
    setStatus('authenticated');
  }, []);

  const login = useCallback(
    async (p: { email?: string; phone?: string; password: string }) => {
      const res = await apiLogin(p);
      await persist(res);
      return res.user;
    },
    [persist],
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY).catch(() => null);
      if (!token) {
        if (alive) setStatus('unauthenticated');
        return;
      }
      try {
        const res = await apiMe();
        if (!alive) return;
        setUser(res.user);
        setStatus('authenticated');
      } catch (e) {
        if (e instanceof ApiError && e.status === 0) {
          // Keep a potentially valid token so a later sign-in/session check can recover.
          if (alive) setStatus('unauthenticated');
          return;
        }
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY).catch(() => undefined);
        if (alive) {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
