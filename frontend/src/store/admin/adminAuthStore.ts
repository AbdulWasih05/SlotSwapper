import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminApi } from '../../services/adminApi';
import type { AdminUser } from '../../types/admin';

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadAdmin: () => Promise<void>;
  clearError: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const data = await adminApi.login(email, password);

          set({
            admin: data.admin,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      loadAdmin: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, isLoading: false, admin: null });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          const data = await adminApi.getCurrentAdmin();

          set({
            admin: data.admin,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Silently fail - don't show error to user, just clear auth state
          set({
            admin: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
