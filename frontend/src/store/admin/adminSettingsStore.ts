import { create } from 'zustand';
import { adminApi } from '../../services/adminApi';
import type { ClinicSettings } from '../../types/admin';

interface AdminSettingsState {
  settings: ClinicSettings | null;
  clinic: { id: number; name: string } | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: ClinicSettings) => Promise<void>;
  updateClinicName: (name: string) => Promise<void>;
  clearError: () => void;
}

const defaultSettings: ClinicSettings = {
  swapApprovalMode: 'auto',
  swapWindowHours: 48,
  allowSameDaySwaps: false,
  maxSwapsPerDay: 5,
};

export const useAdminSettingsStore = create<AdminSettingsState>((set) => ({
  settings: defaultSettings,
  clinic: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.getSettings();
      set({
        settings: data.settings || defaultSettings,
        clinic: data.clinic,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch settings';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateSettings: async (settings: ClinicSettings) => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.updateSettings(settings);
      set({ settings: data.settings, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update settings';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateClinicName: async (name: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.updateClinicName(name);
      set({ clinic: data.clinic, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update clinic name';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
