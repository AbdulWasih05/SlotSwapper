import { Response } from 'express';
import { AdminAuthRequest, ClinicSettings } from '../../types/admin.js';
import { prisma } from '../../utils/prisma.js';
import { clinicSettingsSchema } from '../../utils/adminValidation.js';

/**
 * Get clinic settings
 * GET /api/admin/settings
 */
export const getSettings = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin?.clinicId) {
      // Return default settings if no clinic assigned
      res.status(200).json({
        settings: {
          swapApprovalMode: 'auto',
          swapWindowHours: 48,
          allowSameDaySwaps: false,
          maxSwapsPerDay: 5,
        },
        clinic: null,
      });
      return;
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: req.admin.clinicId },
    });

    if (!clinic) {
      res.status(404).json({ error: 'Clinic not found' });
      return;
    }

    res.status(200).json({
      settings: clinic.settings as unknown as ClinicSettings,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        createdAt: clinic.createdAt,
        updatedAt: clinic.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

/**
 * Update clinic settings
 * PUT /api/admin/settings
 */
export const updateSettings = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin?.clinicId) {
      res.status(400).json({ error: 'No clinic assigned to this admin' });
      return;
    }

    const validatedSettings = clinicSettingsSchema.parse(req.body);

    const clinic = await prisma.clinic.update({
      where: { id: req.admin.clinicId },
      data: {
        settings: validatedSettings,
      },
    });

    res.status(200).json({
      message: 'Settings updated successfully',
      settings: clinic.settings as unknown as ClinicSettings,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        createdAt: clinic.createdAt,
        updatedAt: clinic.updatedAt,
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
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

/**
 * Update clinic name
 * PUT /api/admin/settings/clinic
 */
export const updateClinic = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin?.clinicId) {
      res.status(400).json({ error: 'No clinic assigned to this admin' });
      return;
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Clinic name must be at least 2 characters' });
      return;
    }

    const clinic = await prisma.clinic.update({
      where: { id: req.admin.clinicId },
      data: { name: name.trim() },
    });

    res.status(200).json({
      message: 'Clinic updated successfully',
      clinic: {
        id: clinic.id,
        name: clinic.name,
        settings: clinic.settings,
        createdAt: clinic.createdAt,
        updatedAt: clinic.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update clinic error:', error);
    res.status(500).json({ error: 'Failed to update clinic' });
  }
};
