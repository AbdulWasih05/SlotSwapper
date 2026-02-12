import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AdminAuthRequest, AdminJWTPayload } from '../../types/admin.js';
import { prisma } from '../../utils/prisma.js';
import { generateToken } from '../../utils/jwt.js';
import { adminLoginSchema } from '../../utils/adminValidation.js';

const SALT_ROUNDS = 10;

/**
 * Admin Login
 * POST /api/admin/auth/login
 */
export const adminLogin = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = adminLoginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email },
      include: { clinic: true },
    });

    if (!admin) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token with admin flag
    const payload: AdminJWTPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      clinicId: admin.clinicId,
      isAdmin: true,
    };
    const token = generateToken(payload as any);

    res.status(200).json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        clinicId: admin.clinicId,
        clinic: admin.clinic,
        createdAt: admin.createdAt,
      },
      token,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

/**
 * Get current admin user
 * GET /api/admin/auth/me
 */
export const getCurrentAdmin = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Fetch fresh admin data from database
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      include: { clinic: true },
    });

    if (!admin) {
      res.status(404).json({ error: 'Admin user not found' });
      return;
    }

    res.status(200).json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        clinicId: admin.clinicId,
        clinic: admin.clinic,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get current admin error:', error);
    res.status(500).json({ error: 'Failed to fetch admin data' });
  }
};

/**
 * Create first admin user (seed)
 * POST /api/admin/auth/seed
 * Only works if no admin users exist
 */
export const seedAdmin = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    // Check if any admin users exist
    const adminCount = await prisma.adminUser.count();

    if (adminCount > 0) {
      res.status(400).json({ error: 'Admin users already exist' });
      return;
    }

    // Create default clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: 'Default Clinic',
        settings: {
          swapApprovalMode: 'auto',
          swapWindowHours: 48,
          allowSameDaySwaps: false,
          maxSwapsPerDay: 5,
        },
      },
    });

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    const admin = await prisma.adminUser.create({
      data: {
        email: 'admin@clinic.com',
        password: hashedPassword,
        name: 'Admin User',
        clinicId: clinic.id,
      },
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
      clinic: {
        id: clinic.id,
        name: clinic.name,
      },
      credentials: {
        email: 'admin@clinic.com',
        password: 'admin123',
      },
    });
  } catch (error) {
    console.error('Seed admin error:', error);
    res.status(500).json({ error: 'Failed to seed admin user' });
  }
};
