// Admin User types
export interface Clinic {
  id: number;
  name: string;
  settings?: ClinicSettings;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  clinicId: number | null;
  clinic?: Clinic | null;
  createdAt: string;
  updatedAt?: string;
}

// Clinic Settings
export interface ClinicSettings {
  swapApprovalMode: 'auto' | 'manual';
  swapWindowHours: number;
  allowSameDaySwaps: boolean;
  maxSwapsPerDay: number;
}

// Dashboard types
export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  pendingSwaps: number;
  todayAppointments: number;
}

// Patient types for admin
export interface AdminPatient {
  id: number;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    events: number;
    requestedSwaps: number;
  };
}

// Appointment types for admin
export interface AdminAppointment {
  id: number;
  userId: number;
  title: string;
  startTime: string;
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

// Swap request types for admin
export interface AdminSwapRequest {
  id: number;
  requesterId: number;
  recipientId: number;
  requesterSlotId: number;
  recipientSlotId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  requester: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  recipient: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  requesterSlot: AdminAppointment;
  recipientSlot: AdminAppointment;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response types
export interface AdminLoginResponse {
  message: string;
  admin: AdminUser;
  token: string;
}

export interface PatientsResponse {
  patients: AdminPatient[];
  pagination: Pagination;
}

export interface AppointmentsResponse {
  appointments: AdminAppointment[];
  pagination: Pagination;
}

export interface SwapRequestsResponse {
  swapRequests: AdminSwapRequest[];
  pagination: Pagination;
}

// Form DTOs
export interface CreatePatientData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdatePatientData {
  email?: string;
  name?: string;
  phone?: string;
}

export interface CreateAppointmentData {
  userId: number;
  title: string;
  startTime: string;
  endTime: string;
  status?: 'BUSY' | 'SWAPPABLE';
}

export interface UpdateAppointmentData {
  userId?: number;
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: 'BUSY' | 'SWAPPABLE';
}

// CSV Import
export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface CSVAppointmentRow {
  patientEmail: string;
  title: string;
  startTime: string;
  endTime: string;
}
