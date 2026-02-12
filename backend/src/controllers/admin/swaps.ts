import { Response } from 'express';
import { AdminAuthRequest } from '../../types/admin.js';
import { prisma } from '../../utils/prisma.js';
import { paginationSchema } from '../../utils/adminValidation.js';

/**
 * Get all swap requests with pagination
 * GET /api/admin/swaps
 */
export const getSwapRequests = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;

    // Get status filter
    const status = req.query.status as string | undefined;

    // Build where clause
    const where: any = {};
    if (status && ['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    // Get swap requests and total count
    const [swapRequests, total] = await Promise.all([
      prisma.swapRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: { id: true, name: true, email: true, phone: true },
          },
          recipient: {
            select: { id: true, name: true, email: true, phone: true },
          },
          requesterSlot: true,
          recipientSlot: true,
        },
      }),
      prisma.swapRequest.count({ where }),
    ]);

    res.status(200).json({
      swapRequests,
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
    console.error('Get swap requests error:', error);
    res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
};

/**
 * Get pending swap requests (for quick access)
 * GET /api/admin/swaps/pending
 */
export const getPendingSwaps = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const swapRequests = await prisma.swapRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: { id: true, name: true, email: true, phone: true },
        },
        recipient: {
          select: { id: true, name: true, email: true, phone: true },
        },
        requesterSlot: true,
        recipientSlot: true,
      },
    });

    res.status(200).json({ swapRequests });
  } catch (error) {
    console.error('Get pending swaps error:', error);
    res.status(500).json({ error: 'Failed to fetch pending swap requests' });
  }
};

/**
 * Approve a swap request
 * POST /api/admin/swaps/:id/approve
 */
export const approveSwap = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid swap request ID' });
      return;
    }

    // Find the swap request
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id },
      include: {
        requesterSlot: true,
        recipientSlot: true,
      },
    });

    if (!swapRequest) {
      res.status(404).json({ error: 'Swap request not found' });
      return;
    }

    if (swapRequest.status !== 'PENDING') {
      res.status(400).json({ error: 'Swap request is not pending' });
      return;
    }

    // Perform the swap in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Swap the user IDs between the two events
      const requesterSlotUserId = swapRequest.requesterSlot.userId;
      const recipientSlotUserId = swapRequest.recipientSlot.userId;

      // Update requester's slot to belong to recipient
      await tx.event.update({
        where: { id: swapRequest.requesterSlotId },
        data: {
          userId: recipientSlotUserId,
          status: 'BUSY',
        },
      });

      // Update recipient's slot to belong to requester
      await tx.event.update({
        where: { id: swapRequest.recipientSlotId },
        data: {
          userId: requesterSlotUserId,
          status: 'BUSY',
        },
      });

      // Update swap request status
      const updatedSwapRequest = await tx.swapRequest.update({
        where: { id },
        data: { status: 'ACCEPTED' },
        include: {
          requester: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
          requesterSlot: true,
          recipientSlot: true,
        },
      });

      // Cancel other pending swaps involving these slots
      await tx.swapRequest.updateMany({
        where: {
          id: { not: id },
          status: 'PENDING',
          OR: [
            { requesterSlotId: swapRequest.requesterSlotId },
            { requesterSlotId: swapRequest.recipientSlotId },
            { recipientSlotId: swapRequest.requesterSlotId },
            { recipientSlotId: swapRequest.recipientSlotId },
          ],
        },
        data: { status: 'REJECTED' },
      });

      return updatedSwapRequest;
    });

    // Get socket.io instance and emit notifications
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${swapRequest.requesterId}`).emit('swap-approved', {
        swapRequest: result,
        message: 'Your swap request has been approved by admin',
      });
      io.to(`user:${swapRequest.recipientId}`).emit('swap-approved', {
        swapRequest: result,
        message: 'A swap involving your appointment has been approved by admin',
      });
    }

    res.status(200).json({
      message: 'Swap request approved successfully',
      swapRequest: result,
    });
  } catch (error) {
    console.error('Approve swap error:', error);
    res.status(500).json({ error: 'Failed to approve swap request' });
  }
};

/**
 * Reject a swap request
 * POST /api/admin/swaps/:id/reject
 */
export const rejectSwap = async (req: AdminAuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid swap request ID' });
      return;
    }

    // Find the swap request
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id },
    });

    if (!swapRequest) {
      res.status(404).json({ error: 'Swap request not found' });
      return;
    }

    if (swapRequest.status !== 'PENDING') {
      res.status(400).json({ error: 'Swap request is not pending' });
      return;
    }

    // Update the swap request status and reset event statuses
    const result = await prisma.$transaction(async (tx) => {
      // Update swap request status
      const updatedSwapRequest = await tx.swapRequest.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          requester: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
          requesterSlot: true,
          recipientSlot: true,
        },
      });

      // Reset event statuses back to SWAPPABLE
      await tx.event.update({
        where: { id: swapRequest.requesterSlotId },
        data: { status: 'SWAPPABLE' },
      });

      await tx.event.update({
        where: { id: swapRequest.recipientSlotId },
        data: { status: 'SWAPPABLE' },
      });

      return updatedSwapRequest;
    });

    // Get socket.io instance and emit notifications
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${swapRequest.requesterId}`).emit('swap-rejected', {
        swapRequest: result,
        message: 'Your swap request has been rejected by admin',
      });
      io.to(`user:${swapRequest.recipientId}`).emit('swap-rejected', {
        swapRequest: result,
        message: 'A swap request involving your appointment has been rejected by admin',
      });
    }

    res.status(200).json({
      message: 'Swap request rejected successfully',
      swapRequest: result,
    });
  } catch (error) {
    console.error('Reject swap error:', error);
    res.status(500).json({ error: 'Failed to reject swap request' });
  }
};
