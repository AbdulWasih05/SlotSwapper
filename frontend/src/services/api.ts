import axios, { AxiosInstance } from 'axios';
import type {
  User,
  Event,
  SwapRequest,
  LoginCredentials,
  RegisterCredentials,
  CreateEventData,
  UpdateEventData,
  CreateSwapRequestData,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach auth token
    this.api.interceptors.request.use((config) => {
      // Get token from Zustand persist storage
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (e) {
          console.error('Failed to parse auth storage:', e);
        }
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear auth storage
          localStorage.removeItem('auth-storage');
          // Use dynamic import to avoid circular dependency
          const { useAuthStore } = await import('../store/authStore');
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(credentials: RegisterCredentials) {
    const response = await this.api.post('/auth/register', credentials);
    return response.data;
  }

  async login(credentials: LoginCredentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Event endpoints
  async getEvents(): Promise<{ events: Event[] }> {
    const response = await this.api.get('/events');
    return response.data;
  }

  async createEvent(data: CreateEventData): Promise<{ event: Event }> {
    const response = await this.api.post('/events', data);
    return response.data;
  }

  async updateEvent(id: number, data: UpdateEventData): Promise<{ event: Event }> {
    const response = await this.api.put(`/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/events/${id}`);
    return response.data;
  }

  async toggleEventStatus(id: number, status: 'BUSY' | 'SWAPPABLE'): Promise<{ event: Event }> {
    const response = await this.api.patch(`/events/${id}/status`, { status });
    return response.data;
  }

  // Swap endpoints
  async getSwappableSlots(): Promise<{ slots: Event[] }> {
    const response = await this.api.get('/swappable-slots');
    return response.data;
  }

  async createSwapRequest(data: CreateSwapRequestData): Promise<{ swapRequest: SwapRequest }> {
    const response = await this.api.post('/swap-request', data);
    return response.data;
  }

  async getSwapRequests(): Promise<{ incoming: SwapRequest[]; outgoing: SwapRequest[] }> {
    const response = await this.api.get('/swap-requests');
    return response.data;
  }

  async respondToSwapRequest(
    requestId: number,
    accept: boolean
  ): Promise<{ swapRequest: SwapRequest; updatedEvents?: Event[] }> {
    const response = await this.api.post(`/swap-response/${requestId}`, { accept });
    return response.data;
  }
}

export const api = new ApiService();
