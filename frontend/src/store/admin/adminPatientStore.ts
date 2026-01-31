import { create } from 'zustand';
import { adminApi } from '../../services/adminApi';
import type { AdminPatient, Pagination, CreatePatientData, UpdatePatientData } from '../../types/admin';

interface AdminPatientState {
  patients: AdminPatient[];
  selectedPatient: AdminPatient | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  fetchPatients: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchPatient: (id: number) => Promise<void>;
  createPatient: (data: CreatePatientData) => Promise<AdminPatient>;
  updatePatient: (id: number, data: UpdatePatientData) => Promise<AdminPatient>;
  deletePatient: (id: number) => Promise<void>;
  clearError: () => void;
  clearSelectedPatient: () => void;
}

export const useAdminPatientStore = create<AdminPatientState>((set, get) => ({
  patients: [],
  selectedPatient: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchPatients: async (page = 1, limit = 10, search?: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.getPatients(page, limit, search);
      set({
        patients: data.patients,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch patients';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchPatient: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.getPatient(id);
      set({ selectedPatient: data.patient, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch patient';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createPatient: async (data: CreatePatientData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await adminApi.createPatient(data);
      const { pagination } = get();
      // Refresh the list
      if (pagination) {
        await get().fetchPatients(pagination.page, pagination.limit);
      }
      set({ isLoading: false });
      return response.patient;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create patient';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updatePatient: async (id: number, data: UpdatePatientData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await adminApi.updatePatient(id, data);
      const { pagination } = get();
      // Refresh the list
      if (pagination) {
        await get().fetchPatients(pagination.page, pagination.limit);
      }
      set({ isLoading: false });
      return response.patient;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update patient';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deletePatient: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await adminApi.deletePatient(id);
      const { pagination } = get();
      // Refresh the list
      if (pagination) {
        await get().fetchPatients(pagination.page, pagination.limit);
      }
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete patient';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearSelectedPatient: () => set({ selectedPatient: null }),
}));
