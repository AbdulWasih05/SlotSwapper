import { create } from 'zustand';
import { adminApi } from '../../services/adminApi';
import type { AdminSwapRequest, Pagination } from '../../types/admin';

interface AdminSwapState {
  swapRequests: AdminSwapRequest[];
  pendingSwaps: AdminSwapRequest[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  fetchSwapRequests: (page?: number, limit?: number, status?: string) => Promise<void>;
  fetchPendingSwaps: () => Promise<void>;
  approveSwap: (id: number) => Promise<void>;
  rejectSwap: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useAdminSwapStore = create<AdminSwapState>((set, get) => ({
  swapRequests: [],
  pendingSwaps: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchSwapRequests: async (page = 1, limit = 10, status?: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.getSwapRequests(page, limit, status);
      set({
        swapRequests: data.swapRequests,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch swap requests';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchPendingSwaps: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.getPendingSwaps();
      set({ pendingSwaps: data.swapRequests, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch pending swaps';
      set({ error: errorMessage, isLoading: false });
    }
  },

  approveSwap: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await adminApi.approveSwap(id);
      // Refresh lists
      await Promise.all([get().fetchPendingSwaps(), get().fetchSwapRequests()]);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to approve swap';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  rejectSwap: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await adminApi.rejectSwap(id);
      // Refresh lists
      await Promise.all([get().fetchPendingSwaps(), get().fetchSwapRequests()]);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to reject swap';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
