import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import type { User, LoginCredentials, RegisterCredentials } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          const data = await api.login(credentials);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect to WebSocket
          socketService.connect(data.user.id);
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        try {
          set({ isLoading: true, error: null });
          const data = await api.register(credentials);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect to WebSocket
          socketService.connect(data.user.id);
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        socketService.disconnect();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      loadUser: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });
          const data = await api.getCurrentUser();

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect to WebSocket
          socketService.connect(data.user.id);
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
