import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_STORAGE_KEY } from '@/constants/api';
import { ApiError } from '@/lib/api/client';
import { api } from '@/lib/api/endpoints';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  restoreError: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (p: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    apiary_name: string;
    location: string;
    bee_species?: string;
    nectar_source?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
  refresh: () => Promise<User | null>;
}

async function persistToken(token: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore
  }
}

async function clearToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  status: 'idle',
  restoreError: null,

  restore: async () => {
    set({ status: 'loading', restoreError: null });
    try {
      const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      if (!token) {
        set({ token: null, user: null, status: 'unauthenticated' });
        return;
      }
      const user = await api.me();
      if (user.role !== 'BEEKEEPER') {
        await clearToken();
        set({ token: null, user: null, status: 'unauthenticated' });
        return;
      }
      set({ token, user, status: 'authenticated', restoreError: null });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearToken();
        set({ token: null, user: null, status: 'unauthenticated', restoreError: null });
        return;
      }
      set({
        token: null,
        user: null,
        status: 'error',
        restoreError: error instanceof Error ? error.message : 'The saved session could not be restored.',
      });
    }
  },

  login: async (identifier, password) => {
    const credential = identifier.includes('@') ? { email: identifier.trim() } : { phone: identifier.trim() };
    const { token, user } = await api.login({ ...credential, password });
    if (user.role !== 'BEEKEEPER') {
      throw new Error('This app is only available to beekeeper accounts.');
    }
    await persistToken(token);
    set({ token, user, status: 'authenticated', restoreError: null });
  },

  signup: async (p) => {
    const { token, user } = await api.signup(p);
    if (user.role !== 'BEEKEEPER') throw new Error('A beekeeper account could not be created.');
    await persistToken(token);
    set({ token, user, status: 'authenticated', restoreError: null });
  },

  logout: async () => {
    await clearToken();
    set({ token: null, user: null, status: 'unauthenticated', restoreError: null });
  },

  refresh: async () => {
    try {
      const user = await api.me();
      set({ user });
      return user;
    } catch {
      await get().logout();
      return null;
    }
  },
}));
