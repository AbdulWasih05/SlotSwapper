import { z } from 'zod';

// Admin Auth validation schemas
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Patient validation schemas
export const createPatientSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const updatePatientSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
});

// Appointment validation schemas
export const createAppointmentSchema = z.object({
  userId: z.number().int().positive('Invalid user ID'),
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  status: z.enum(['BUSY', 'SWAPPABLE']).optional(),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateAppointmentSchema = z.object({
  userId: z.number().int().positive('Invalid user ID').optional(),
  title: z.string().min(1, 'Title is required').optional(),
  startTime: z.string().datetime('Invalid start time format').optional(),
  endTime: z.string().datetime('Invalid end time format').optional(),
  status: z.enum(['BUSY', 'SWAPPABLE']).optional(),
});

// Clinic settings validation schema
export const clinicSettingsSchema = z.object({
  swapApprovalMode: z.enum(['auto', 'manual']),
  swapWindowHours: z.number().int().min(1).max(168),
  allowSameDaySwaps: z.boolean(),
  maxSwapsPerDay: z.number().int().min(1).max(100),
});

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

// CSV import validation schemas
export const csvAppointmentRowSchema = z.object({
  patientEmail: z.string().email('Invalid patient email'),
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
});
