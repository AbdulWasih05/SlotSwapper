import { Response } from 'express';
import { AdminAuthRequest } from '../../types/admin.js';
import { prisma } from '../../utils/prisma.js';
import { createAppointmentSchema, updateAppointmentSchema, paginationSchema } from '../../utils/adminValidation.js';

/**
 * Get all appointments with pagination and filtering
 * GET /api/admin/appointments
 */
export const getAppointments = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;

    // Get date range from query params
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const status = req.query.status as string | undefined;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.startTime = { gte: startDate };
    } else if (endDate) {
      where.startTime = { lte: endDate };
    }

    if (userId) {
      where.userId = userId;
    }

    if (status && ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'].includes(status)) {
      where.status = status;
    }

    // Get appointments and total count
    const [appointments, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    res.status(200).json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

/**
 * Get appointments for calendar view (no pagination, date range required)
 * GET /api/admin/appointments/calendar
 */
export const getCalendarAppointments = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const appointments = await prisma.event.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { startTime: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Get calendar appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar appointments' });
  }
};

/**
 * Get single appointment by ID
 * GET /api/admin/appointments/:id
 */
export const getAppointment = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid appointment ID' });
      return;
    }

    const appointment = await prisma.event.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        requesterSwaps: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            recipient: { select: { id: true, name: true, email: true } },
            recipientSlot: true,
          },
        },
        recipientSwaps: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            recipient: { select: { id: true, name: true, email: true } },
            requesterSlot: true,
          },
        },
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    res.status(200).json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

/**
 * Create new appointment
 * POST /api/admin/appointments
 */
export const createAppointment = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createAppointmentSchema.parse(req.body);
    const { userId, title, startTime, endTime, status } = validatedData;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Create appointment
    const appointment = await prisma.event.create({
      data: {
        userId,
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: status || 'BUSY',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

/**
 * Update appointment
 * PUT /api/admin/appointments/:id
 */
export const updateAppointment = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid appointment ID' });
      return;
    }

    const validatedData = updateAppointmentSchema.parse(req.body);

    // Check if appointment exists
    const existingAppointment = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // If userId is being changed, verify new user exists
    if (validatedData.userId) {
      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
      });
      if (!user) {
        res.status(404).json({ error: 'Patient not found' });
        return;
      }
    }

    // Build update data
    const updateData: any = { ...validatedData };
    if (validatedData.startTime) {
      updateData.startTime = new Date(validatedData.startTime);
    }
    if (validatedData.endTime) {
      updateData.endTime = new Date(validatedData.endTime);
    }

    // Update appointment
    const appointment = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

/**
 * Delete appointment
 * DELETE /api/admin/appointments/:id
 */
export const deleteAppointment = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid appointment ID' });
      return;
    }

    // Check if appointment exists
    const existingAppointment = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Delete appointment (cascade will delete related swap requests)
    await prisma.event.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};
