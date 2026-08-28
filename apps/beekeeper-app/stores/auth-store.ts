import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_STORAGE_KEY } from '@/constants/api';
import { api } from '@/lib/api/endpoints';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  login: (email: string, password: string) => Promise<void>;
  signup: (p: {
    name: string;
    email: string;
    password: string;
    apiary_name: string;
    location: string;
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

  restore: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      if (!token) {
        set({ status: 'unauthenticated' });
        return;
      }
      const user = await api.me();
      set({ token, user, status: 'authenticated' });
    } catch {
      await clearToken();
      set({ token: null, user: null, status: 'unauthenticated' });
    }
  },

  login: async (email, password) => {
    const { token, user } = await api.login({ email, password });
    await persistToken(token);
    set({ token, user, status: 'authenticated' });
  },

  signup: async (p) => {
    const { token, user } = await api.signup(p);
    await persistToken(token);
    set({ token, user, status: 'authenticated' });
  },

  logout: async () => {
    await clearToken();
    set({ token: null, user: null, status: 'unauthenticated' });
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
