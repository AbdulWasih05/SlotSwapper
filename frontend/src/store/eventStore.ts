import { create } from 'zustand';
import { api } from '../services/api';
import type { Event, CreateEventData, UpdateEventData } from '../types';

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (data: CreateEventData) => Promise<void>;
  updateEvent: (id: number, data: UpdateEventData) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  toggleEventStatus: (id: number, status: 'BUSY' | 'SWAPPABLE') => Promise<void>;
  updateEventInStore: (event: Event) => void;
  clearError: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getEvents();
      set({ events: data.events, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch events';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createEvent: async (data: CreateEventData) => {
    try {
      set({ isLoading: true, error: null });
      const result = await api.createEvent(data);
      set((state) => ({
        events: [...state.events, result.event],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create event';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateEvent: async (id: number, data: UpdateEventData) => {
    try {
      set({ isLoading: true, error: null });
      const result = await api.updateEvent(id, data);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? result.event : e)),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update event';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await api.deleteEvent(id);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete event';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  toggleEventStatus: async (id: number, status: 'BUSY' | 'SWAPPABLE') => {
    try {
      set({ isLoading: true, error: null });
      const result = await api.toggleEventStatus(id, status);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? result.event : e)),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update status';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateEventInStore: (event: Event) => {
    set((state) => {
      const exists = state.events.some((e) => e.id === event.id);
      if (exists) {
        // Update existing event
        return {
          events: state.events.map((e) => (e.id === event.id ? event : e)),
        };
      } else {
        // Add new event if it doesn't exist (from real-time updates)
        return {
          events: [...state.events, event],
        };
      }
    });
  },

  clearError: () => set({ error: null }),
}));
