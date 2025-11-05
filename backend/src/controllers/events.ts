import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../utils/prisma.js';
import { createEventSchema, updateEventSchema, updateStatusSchema } from '../utils/validation.js';

/**
 * Get all events for the current user
 * GET /api/events
 */
export const getUserEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const events = await prisma.event.findMany({
      where: { userId: req.user.id },
      orderBy: { startTime: 'asc' },
    });

    res.status(200).json({ events });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/**
 * Create a new event
 * POST /api/events
 */
export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Validate request body
    const validatedData = createEventSchema.parse(req.body);
    const { title, startTime, endTime } = validatedData;

    // Create event
    const event = await prisma.event.create({
      data: {
        userId: req.user.id,
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'BUSY', // Default status
      },
    });

    // Broadcast event creation to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('event:created', { event, userId: req.user.id });
    }

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

/**
 * Update an event
 * PUT /api/events/:id
 */
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      res.status(400).json({ error: 'Invalid event ID' });
      return;
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (existingEvent.userId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized to update this event' });
      return;
    }

    // Validate request body
    const validatedData = updateEventSchema.parse(req.body);

    // Prepare update data
    const updateData: any = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.startTime !== undefined) updateData.startTime = new Date(validatedData.startTime);
    if (validatedData.endTime !== undefined) updateData.endTime = new Date(validatedData.endTime);
    if (validatedData.status !== undefined) updateData.status = validatedData.status;

    // Update event
    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    // Broadcast event update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('event:updated', { event, userId: req.user.id });
    }

    res.status(200).json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

/**
 * Delete an event
 * DELETE /api/events/:id
 */
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      res.status(400).json({ error: 'Invalid event ID' });
      return;
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (existingEvent.userId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized to delete this event' });
      return;
    }

    // Delete event
    await prisma.event.delete({
      where: { id: eventId },
    });

    // Broadcast event deletion to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('event:deleted', { eventId, userId: req.user.id });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

/**
 * Toggle event status (BUSY <-> SWAPPABLE)
 * PATCH /api/events/:id/status
 */
export const toggleEventStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      res.status(400).json({ error: 'Invalid event ID' });
      return;
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (existingEvent.userId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized to update this event' });
      return;
    }

    // Don't allow changing status if there's a pending swap
    if (existingEvent.status === 'SWAP_PENDING') {
      res.status(400).json({ error: 'Cannot change status while swap is pending' });
      return;
    }

    // Validate request body
    const validatedData = updateStatusSchema.parse(req.body);

    // Update status
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status: validatedData.status },
    });

    // Broadcast status update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('event:updated', { event, userId: req.user.id });
    }

    res.status(200).json({
      message: 'Event status updated successfully',
      event,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }
    console.error('Toggle event status error:', error);
    res.status(500).json({ error: 'Failed to update event status' });
  }
};
