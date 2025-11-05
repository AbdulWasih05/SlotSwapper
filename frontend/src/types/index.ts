// User types
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

// Event types
export type EventStatus = 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';

export interface Event {
  id: number;
  userId: number;
  title: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Swap types
export type SwapStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface SwapRequest {
  id: number;
  requesterId: number;
  recipientId: number;
  requesterSlotId: number;
  recipientSlotId: number;
  status: SwapStatus;
  createdAt: string;
  updatedAt: string;
  requester: User;
  recipient: User;
  requesterSlot: Event;
  recipientSlot: Event;
}

// Auth DTOs
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

// Event DTOs
export interface CreateEventData {
  title: string;
  startTime: string;
  endTime: string;
}

export interface UpdateEventData {
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: EventStatus;
}

// Swap DTOs
export interface CreateSwapRequestData {
  mySlotId: number;
  theirSlotId: number;
}
