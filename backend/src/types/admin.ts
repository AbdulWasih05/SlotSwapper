import { Request } from 'express';

// Extend Express Request to include admin user data
export interface AdminAuthRequest extends Request {
  admin?: {
    id: number;
    email: string;
    name: string;
    clinicId: number | null;
  };
}

// Admin Auth DTOs
export interface AdminLoginDTO {
  email: string;
  password: string;
}

// Admin JWT Payload
export interface AdminJWTPayload {
  id: number;
  email: string;
  name: string;
  clinicId: number | null;
  isAdmin: true;
}

// Clinic Settings structure
export interface ClinicSettings {
  swapApprovalMode: 'auto' | 'manual';
  swapWindowHours: number;
  allowSameDaySwaps: boolean;
  maxSwapsPerDay: number;
}

// Dashboard stats
export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  pendingSwaps: number;
  todayAppointments: number;
}

// Patient CRUD DTOs
export interface CreatePatientDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdatePatientDTO {
  email?: string;
  name?: string;
  phone?: string;
}

// Appointment CRUD DTOs
export interface CreateAppointmentDTO {
  userId: number;
  title: string;
  startTime: string;
  endTime: string;
  status?: 'BUSY' | 'SWAPPABLE';
}

export interface UpdateAppointmentDTO {
  userId?: number;
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: 'BUSY' | 'SWAPPABLE';
}

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

// CSV Import result
export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}
