import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Event validation schemas
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  startTime: z.string().datetime('Invalid start time format').optional(),
  endTime: z.string().datetime('Invalid end time format').optional(),
  status: z.enum(['BUSY', 'SWAPPABLE']).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['BUSY', 'SWAPPABLE'], {
    errorMap: () => ({ message: 'Status must be BUSY or SWAPPABLE' }),
  }),
});

// Swap validation schemas
export const createSwapRequestSchema = z.object({
  mySlotId: z.number().int().positive('Invalid slot ID'),
  theirSlotId: z.number().int().positive('Invalid slot ID'),
}).refine((data) => data.mySlotId !== data.theirSlotId, {
  message: 'Cannot swap a slot with itself',
  path: ['theirSlotId'],
});

export const swapResponseSchema = z.object({
  accept: z.boolean(),
});
