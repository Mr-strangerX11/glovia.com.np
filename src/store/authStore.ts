import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';
import { initCsrfToken } from '@/lib/csrf';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.login({ email, password });
          const { user } = response.data;
          // Server sets HttpOnly cookies; do not store tokens in JS-accessible cookies.
          // Refresh CSRF token — backend issues a fresh one on every login.
          set({ user, isAuthenticated: true, isLoading: false });
          initCsrfToken();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          await authAPI.register(data);
          // Do not set user or tokens yet; wait for OTP verification
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Server will clear cookies; clear client state only
          set({ user: null, isAuthenticated: false });
        }
      },

      hydrate: async () => {
        try {
          set({ isLoading: true });
          const { data } = await authAPI.getProfile();
          set({ user: data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
