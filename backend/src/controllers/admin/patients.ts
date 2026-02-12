import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AdminAuthRequest } from '../../types/admin.js';
import { prisma } from '../../utils/prisma.js';
import { createPatientSchema, updatePatientSchema, paginationSchema } from '../../utils/adminValidation.js';

const SALT_ROUNDS = 10;

/**
 * Get all patients with pagination
 * GET /api/admin/patients
 */
export const getPatients = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    // Get patients and total count
    const [patients, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              events: true,
              requestedSwaps: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      patients,
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
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

/**
 * Get single patient by ID
 * GET /api/admin/patients/:id
 */
export const getPatient = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid patient ID' });
      return;
    }

    const patient = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        events: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            events: true,
            requestedSwaps: true,
            receivedSwaps: true,
          },
        },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    res.status(200).json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

/**
 * Create new patient
 * POST /api/admin/patients
 */
export const createPatient = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createPatientSchema.parse(req.body);
    const { email, password, name, phone } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create patient
    const patient = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Patient created successfully',
      patient,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};

/**
 * Update patient
 * PUT /api/admin/patients/:id
 */
export const updatePatient = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid patient ID' });
      return;
    }

    const validatedData = updatePatientSchema.parse(req.body);

    // Check if patient exists
    const existingPatient = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingPatient.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (emailTaken) {
        res.status(400).json({ error: 'Email is already in use' });
        return;
      }
    }

    // Update patient
    const patient = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'Patient updated successfully',
      patient,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
};

/**
 * Delete patient
 * DELETE /api/admin/patients/:id
 */
export const deletePatient = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid patient ID' });
      return;
    }

    // Check if patient exists
    const existingPatient = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Delete patient (cascade will delete related events and swap requests)
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
};
