import { Response } from 'express';
import { AdminAuthRequest } from '../../types/admin.js';
import { prisma } from '../../utils/prisma.js';
import { csvAppointmentRowSchema } from '../../utils/adminValidation.js';

/**
 * Import appointments from CSV data
 * POST /api/admin/import/appointments
 */
export const importAppointments = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: 'No data provided for import' });
      return;
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;

      try {
        // Validate row data
        const validatedRow = csvAppointmentRowSchema.parse(row);

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: validatedRow.patientEmail },
        });

        if (!user) {
          results.failed++;
          results.errors.push(`Row ${rowNum}: Patient with email "${validatedRow.patientEmail}" not found`);
          continue;
        }

        // Create appointment
        await prisma.event.create({
          data: {
            userId: user.id,
            title: validatedRow.title,
            startTime: new Date(validatedRow.startTime),
            endTime: new Date(validatedRow.endTime),
            status: 'BUSY',
          },
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        if (error.name === 'ZodError') {
          const errorMessages = error.errors.map((e: any) => e.message).join(', ');
          results.errors.push(`Row ${rowNum}: ${errorMessages}`);
        } else {
          results.errors.push(`Row ${rowNum}: ${error.message || 'Unknown error'}`);
        }
      }
    }

    res.status(200).json({
      message: `Import completed. ${results.success} appointments created, ${results.failed} failed.`,
      results,
    });
  } catch (error) {
    console.error('Import appointments error:', error);
    res.status(500).json({ error: 'Failed to import appointments' });
  }
};

/**
 * Get CSV template for appointment import
 * GET /api/admin/import/template
 */
export const getImportTemplate = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const template = {
      headers: ['patientEmail', 'title', 'startTime', 'endTime'],
      example: [
        {
          patientEmail: 'patient@example.com',
          title: 'Dental Checkup',
          startTime: '2024-01-15T09:00:00.000Z',
          endTime: '2024-01-15T10:00:00.000Z',
        },
        {
          patientEmail: 'another@example.com',
          title: 'General Consultation',
          startTime: '2024-01-15T10:30:00.000Z',
          endTime: '2024-01-15T11:00:00.000Z',
        },
      ],
      instructions: [
        'patientEmail: Must be an existing patient email in the system',
        'title: Description of the appointment',
        'startTime: ISO 8601 date-time format (e.g., 2024-01-15T09:00:00.000Z)',
        'endTime: ISO 8601 date-time format, must be after startTime',
      ],
    };

    res.status(200).json({ template });
  } catch (error) {
    console.error('Get import template error:', error);
    res.status(500).json({ error: 'Failed to get import template' });
  }
};

/**
 * Download CSV template as file
 * GET /api/admin/import/template/download
 */
export const downloadImportTemplate = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const csvContent = `patientEmail,title,startTime,endTime
patient@example.com,Dental Checkup,2024-01-15T09:00:00.000Z,2024-01-15T10:00:00.000Z
another@example.com,General Consultation,2024-01-15T10:30:00.000Z,2024-01-15T11:00:00.000Z`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="appointments_template.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Download import template error:', error);
    res.status(500).json({ error: 'Failed to download import template' });
  }
};
