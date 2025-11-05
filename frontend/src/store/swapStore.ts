import { create } from 'zustand';
import { api } from '../services/api';
import type { Event, SwapRequest, CreateSwapRequestData } from '../types';

interface SwapState {
  swappableSlots: Event[];
  incomingRequests: SwapRequest[];
  outgoingRequests: SwapRequest[];
  isLoading: boolean;
  error: string | null;
  fetchSwappableSlots: () => Promise<void>;
  fetchSwapRequests: () => Promise<void>;
  createSwapRequest: (data: CreateSwapRequestData) => Promise<void>;
  respondToSwapRequest: (requestId: number, accept: boolean) => Promise<void>;
  updateSwapRequestInStore: (swapRequest: SwapRequest) => void;
  addOrUpdateSwappableSlot: (slot: Event) => void;
  removeSwappableSlot: (slotId: number) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useSwapStore = create<SwapState>((set) => ({
  swappableSlots: [],
  incomingRequests: [],
  outgoingRequests: [],
  isLoading: false,
  error: null,

  fetchSwappableSlots: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getSwappableSlots();
      set({ swappableSlots: data.slots, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch swappable slots';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchSwapRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getSwapRequests();
      set({
        incomingRequests: data.incoming,
        outgoingRequests: data.outgoing,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch swap requests';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createSwapRequest: async (data: CreateSwapRequestData) => {
    try {
      set({ isLoading: true, error: null });
      const result = await api.createSwapRequest(data);
      set((state) => ({
        outgoingRequests: [result.swapRequest, ...state.outgoingRequests],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create swap request';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  respondToSwapRequest: async (requestId: number, accept: boolean) => {
    try {
      set({ isLoading: true, error: null });
      const result = await api.respondToSwapRequest(requestId, accept);

      // Merge the updated request with existing data to preserve slot information
      set((state) => ({
        incomingRequests: state.incomingRequests.map((req) =>
          req.id === requestId
            ? { ...req, ...result.swapRequest, requesterSlot: result.swapRequest.requesterSlot || req.requesterSlot, recipientSlot: result.swapRequest.recipientSlot || req.recipientSlot }
            : req
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to respond to swap request';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateSwapRequestInStore: (swapRequest: SwapRequest) => {
    set((state) => ({
      incomingRequests: state.incomingRequests.map((req) =>
        req.id === swapRequest.id
          ? { ...req, ...swapRequest, requesterSlot: swapRequest.requesterSlot || req.requesterSlot, recipientSlot: swapRequest.recipientSlot || req.recipientSlot }
          : req
      ),
      outgoingRequests: state.outgoingRequests.map((req) =>
        req.id === swapRequest.id
          ? { ...req, ...swapRequest, requesterSlot: swapRequest.requesterSlot || req.requesterSlot, recipientSlot: swapRequest.recipientSlot || req.recipientSlot }
          : req
      ),
    }));
  },

  addOrUpdateSwappableSlot: (slot: Event) => {
    set((state) => {
      const exists = state.swappableSlots.some((s) => s.id === slot.id);
      if (exists) {
        // Update existing slot
        return {
          swappableSlots: state.swappableSlots.map((s) =>
            s.id === slot.id ? slot : s
          ),
        };
      } else {
        // Add new slot
        return {
          swappableSlots: [...state.swappableSlots, slot],
        };
      }
    });
  },

  removeSwappableSlot: (slotId: number) => {
    set((state) => ({
      swappableSlots: state.swappableSlots.filter((s) => s.id !== slotId),
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  clearError: () => set({ error: null }),
}));
