import axios, { AxiosInstance } from 'axios';
import type {
  AdminUser,
  AdminLoginResponse,
  DashboardStats,
  AdminPatient,
  PatientsResponse,
  AdminAppointment,
  AppointmentsResponse,
  AdminSwapRequest,
  SwapRequestsResponse,
  ClinicSettings,
  CreatePatientData,
  UpdatePatientData,
  CreateAppointmentData,
  UpdateAppointmentData,
  ImportResult,
  CSVAppointmentRow,
} from '../types/admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class AdminApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api/admin`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach auth token
    this.api.interceptors.request.use((config) => {
      const authStorage = localStorage.getItem('admin-auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (e) {
          console.error('Failed to parse admin auth storage:', e);
        }
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Don't redirect if already on login page or if this is a login/seed request
          const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/seed');
          const isOnLoginPage = window.location.pathname === '/admin/login';

          if (!isAuthRequest && !isOnLoginPage) {
            localStorage.removeItem('admin-auth-storage');
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async getCurrentAdmin(): Promise<{ admin: AdminUser }> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async seedAdmin(): Promise<any> {
    const response = await this.api.post('/auth/seed');
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  async getRecentActivity(): Promise<{
    recentSwaps: AdminSwapRequest[];
    recentAppointments: AdminAppointment[];
    recentPatients: AdminPatient[];
  }> {
    const response = await this.api.get('/dashboard/activity');
    return response.data;
  }

  // Patient endpoints
  async getPatients(page = 1, limit = 10, search?: string): Promise<PatientsResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    const response = await this.api.get(`/patients?${params}`);
    return response.data;
  }

  async getPatient(id: number): Promise<{ patient: AdminPatient }> {
    const response = await this.api.get(`/patients/${id}`);
    return response.data;
  }

  async createPatient(data: CreatePatientData): Promise<{ message: string; patient: AdminPatient }> {
    const response = await this.api.post('/patients', data);
    return response.data;
  }

  async updatePatient(id: number, data: UpdatePatientData): Promise<{ message: string; patient: AdminPatient }> {
    const response = await this.api.put(`/patients/${id}`, data);
    return response.data;
  }

  async deletePatient(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/patients/${id}`);
    return response.data;
  }

  // Appointment endpoints
  async getAppointments(
    page = 1,
    limit = 10,
    options?: {
      search?: string;
      startDate?: string;
      endDate?: string;
      userId?: number;
      status?: string;
    }
  ): Promise<AppointmentsResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (options?.search) params.append('search', options.search);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.userId) params.append('userId', String(options.userId));
    if (options?.status) params.append('status', options.status);
    const response = await this.api.get(`/appointments?${params}`);
    return response.data;
  }

  async getCalendarAppointments(startDate: string, endDate: string): Promise<{ appointments: AdminAppointment[] }> {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await this.api.get(`/appointments/calendar?${params}`);
    return response.data;
  }

  async getAppointment(id: number): Promise<{ appointment: AdminAppointment }> {
    const response = await this.api.get(`/appointments/${id}`);
    return response.data;
  }

  async createAppointment(data: CreateAppointmentData): Promise<{ message: string; appointment: AdminAppointment }> {
    const response = await this.api.post('/appointments', data);
    return response.data;
  }

  async updateAppointment(id: number, data: UpdateAppointmentData): Promise<{ message: string; appointment: AdminAppointment }> {
    const response = await this.api.put(`/appointments/${id}`, data);
    return response.data;
  }

  async deleteAppointment(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/appointments/${id}`);
    return response.data;
  }

  // Swap endpoints
  async getSwapRequests(page = 1, limit = 10, status?: string): Promise<SwapRequestsResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await this.api.get(`/swaps?${params}`);
    return response.data;
  }

  async getPendingSwaps(): Promise<{ swapRequests: AdminSwapRequest[] }> {
    const response = await this.api.get('/swaps/pending');
    return response.data;
  }

  async approveSwap(id: number): Promise<{ message: string; swapRequest: AdminSwapRequest }> {
    const response = await this.api.post(`/swaps/${id}/approve`);
    return response.data;
  }

  async rejectSwap(id: number): Promise<{ message: string; swapRequest: AdminSwapRequest }> {
    const response = await this.api.post(`/swaps/${id}/reject`);
    return response.data;
  }

  // Settings endpoints
  async getSettings(): Promise<{ settings: ClinicSettings; clinic: { id: number; name: string } | null }> {
    const response = await this.api.get('/settings');
    return response.data;
  }

  async updateSettings(settings: ClinicSettings): Promise<{ message: string; settings: ClinicSettings }> {
    const response = await this.api.put('/settings', settings);
    return response.data;
  }

  async updateClinicName(name: string): Promise<{ message: string; clinic: { id: number; name: string } }> {
    const response = await this.api.put('/settings/clinic', { name });
    return response.data;
  }

  // Import endpoints
  async importAppointments(data: CSVAppointmentRow[]): Promise<{ message: string; results: ImportResult }> {
    const response = await this.api.post('/import/appointments', { data });
    return response.data;
  }

  async getImportTemplate(): Promise<{ template: any }> {
    const response = await this.api.get('/import/template');
    return response.data;
  }

  getImportTemplateDownloadUrl(): string {
    return `${API_URL}/api/admin/import/template/download`;
  }
}

export const adminApi = new AdminApiService();
