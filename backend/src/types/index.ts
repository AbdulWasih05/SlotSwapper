import { Request } from 'express';

// Extend Express Request to include user data
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

// Auth DTOs
export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Event DTOs
export interface CreateEventDTO {
  title: string;
  startTime: string | Date;
  endTime: string | Date;
}

export interface UpdateEventDTO {
  title?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  status?: 'BUSY' | 'SWAPPABLE';
}

// Swap DTOs
export interface CreateSwapRequestDTO {
  mySlotId: number;
  theirSlotId: number;
}

export interface SwapResponseDTO {
  accept: boolean;
}

// JWT Payload
export interface JWTPayload {
  id: number;
  email: string;
  name: string;
}
