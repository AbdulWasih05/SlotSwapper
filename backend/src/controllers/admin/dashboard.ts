import { Response } from 'express';
import { AdminAuthRequest } from '../../types/admin.js';
import { prisma } from '../../utils/prisma.js';

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    // Get start and end of today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Run all queries in parallel
    const [totalPatients, totalAppointments, pendingSwaps, todayAppointments] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.swapRequest.count({
        where: { status: 'PENDING' },
      }),
      prisma.event.count({
        where: {
          startTime: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
    ]);

    res.status(200).json({
      stats: {
        totalPatients,
        totalAppointments,
        pendingSwaps,
        todayAppointments,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

/**
 * Get recent activity for dashboard
 * GET /api/admin/dashboard/activity
 */
export const getRecentActivity = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    // Get recent swap requests
    const recentSwaps = await prisma.swapRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        requesterSlot: true,
        recipientSlot: true,
      },
    });

    // Get recent appointments
    const recentAppointments = await prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Get recent patients
    const recentPatients = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      recentSwaps,
      recentAppointments,
      recentPatients,
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};
