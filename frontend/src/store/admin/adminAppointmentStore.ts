import { create } from 'zustand';
import { adminApi } from '../../services/adminApi';
import type { AdminAppointment, Pagination, CreateAppointmentData, UpdateAppointmentData } from '../../types/admin';

interface AdminAppointmentState {
  appointments: AdminAppointment[];
  calendarAppointments: AdminAppointment[];
  selectedAppointment: AdminAppointment | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  fetchAppointments: (
    page?: number,
    limit?: number,
    options?: {
      search?: string;
      startDate?: string;
      endDate?: string;
      userId?: number;
      status?: string;
    }
  ) => Promise<void>;
  fetchCalendarAppointments: (startDate: string, endDate: string) => Promise<void>;
  fetchAppointment: (id: number) => Promise<void>;
  createAppointment: (data: CreateAppointmentData) => Promise<AdminAppointment>;
  updateAppointment: (id: number, data: UpdateAppointmentData) => Promise<AdminAppointment>;
  deleteAppointment: (id: number) => Promise<void>;
  clearError: () => void;
  clearSelectedAppointment: () => void;
}

export const useAdminAppointmentStore = create<AdminAppointmentState>((set) => ({
  appointments: [],
  calendarAppointments: [],
  selectedAppointment: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchAppointments: async (page = 1, limit = 10, options) => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.getAppointments(page, limit, options);
      set({
        appointments: data.appointments,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch appointments';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchCalendarAppointments: async (startDate: string, endDate: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.getCalendarAppointments(startDate, endDate);
      set({ calendarAppointments: data.appointments, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch calendar appointments';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAppointment: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const data = await adminApi.getAppointment(id);
      set({ selectedAppointment: data.appointment, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch appointment';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createAppointment: async (data: CreateAppointmentData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await adminApi.createAppointment(data);
      set({ isLoading: false });
      return response.appointment;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create appointment';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateAppointment: async (id: number, data: UpdateAppointmentData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await adminApi.updateAppointment(id, data);
      set({ isLoading: false });
      return response.appointment;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update appointment';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteAppointment: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await adminApi.deleteAppointment(id);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete appointment';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearSelectedAppointment: () => set({ selectedAppointment: null }),
}));
