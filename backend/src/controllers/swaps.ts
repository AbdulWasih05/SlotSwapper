import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../utils/prisma.js';
import { createSwapRequestSchema, swapResponseSchema } from '../utils/validation.js';

/**
 * Get all swappable slots from other users
 * GET /api/swappable-slots
 */
export const getSwappableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get all swappable slots except user's own
    const slots = await prisma.event.findMany({
      where: {
        status: 'SWAPPABLE',
        userId: { not: req.user.id }, // Exclude user's own slots
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.status(200).json({ slots });
  } catch (error) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({ error: 'Failed to fetch swappable slots' });
  }
};

/**
 * Create a swap request
 * POST /api/swap-request
 */
export const createSwapRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Validate request body
    const validatedData = createSwapRequestSchema.parse(req.body);
    const { mySlotId, theirSlotId } = validatedData;

    // Fetch both slots
    const [mySlot, theirSlot] = await Promise.all([
      prisma.event.findUnique({ where: { id: mySlotId } }),
      prisma.event.findUnique({ where: { id: theirSlotId } }),
    ]);

    // Validate my slot
    if (!mySlot) {
      res.status(404).json({ error: 'Your slot not found' });
      return;
    }

    if (mySlot.userId !== req.user.id) {
      res.status(403).json({ error: 'You do not own this slot' });
      return;
    }

    if (mySlot.status !== 'SWAPPABLE') {
      res.status(400).json({ error: 'Your slot must be marked as SWAPPABLE' });
      return;
    }

    // Validate their slot
    if (!theirSlot) {
      res.status(404).json({ error: 'Requested slot not found' });
      return;
    }

    if (theirSlot.userId === req.user.id) {
      res.status(400).json({ error: 'Cannot request swap with your own slot' });
      return;
    }

    if (theirSlot.status !== 'SWAPPABLE') {
      res.status(400).json({ error: 'Requested slot is not available for swapping' });
      return;
    }

    // Check if there's already a pending swap request for these slots
    const existingSwap = await prisma.swapRequest.findFirst({
      where: {
        OR: [
          {
            requesterSlotId: mySlotId,
            status: 'PENDING',
          },
          {
            recipientSlotId: mySlotId,
            status: 'PENDING',
          },
          {
            requesterSlotId: theirSlotId,
            status: 'PENDING',
          },
          {
            recipientSlotId: theirSlotId,
            status: 'PENDING',
          },
        ],
      },
    });

    if (existingSwap) {
      res.status(400).json({ error: 'One or both slots already have a pending swap request' });
      return;
    }

    // Create swap request and update both slots to SWAP_PENDING
    const swapRequest = await prisma.$transaction(async (tx) => {
      // Update both slots to SWAP_PENDING
      await Promise.all([
        tx.event.update({
          where: { id: mySlotId },
          data: { status: 'SWAP_PENDING' },
        }),
        tx.event.update({
          where: { id: theirSlotId },
          data: { status: 'SWAP_PENDING' },
        }),
      ]);

      // Create swap request
      const swap = await tx.swapRequest.create({
        data: {
          requesterId: req.user!.id,
          recipientId: theirSlot.userId,
          requesterSlotId: mySlotId,
          recipientSlotId: theirSlotId,
          status: 'PENDING',
        },
        include: {
          requester: {
            select: { id: true, name: true, email: true },
          },
          recipient: {
            select: { id: true, name: true, email: true },
          },
          requesterSlot: true,
          recipientSlot: true,
        },
      });

      return swap;
    });

    // Emit WebSocket event to recipient
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${theirSlot.userId}`).emit('swap:request:received', {
        swapRequest,
        message: `${req.user.name} wants to swap slots with you`,
      });
    }

    res.status(201).json({
      message: 'Swap request created successfully',
      swapRequest,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }
    console.error('Create swap request error:', error);
    res.status(500).json({ error: 'Failed to create swap request' });
  }
};

/**
 * Get all swap requests (incoming and outgoing)
 * GET /api/swap-requests
 */
export const getSwapRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get incoming swap requests (where user is recipient)
    const incoming = await prisma.swapRequest.findMany({
      where: {
        recipientId: req.user.id,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        recipient: {
          select: { id: true, name: true, email: true },
        },
        requesterSlot: true,
        recipientSlot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get outgoing swap requests (where user is requester)
    const outgoing = await prisma.swapRequest.findMany({
      where: {
        requesterId: req.user.id,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        recipient: {
          select: { id: true, name: true, email: true },
        },
        requesterSlot: true,
        recipientSlot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ incoming, outgoing });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
};

/**
 * Accept or reject a swap request
 * POST /api/swap-response/:requestId
 */
export const respondToSwapRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const requestId = parseInt(req.params.requestId);

    if (isNaN(requestId)) {
      res.status(400).json({ error: 'Invalid request ID' });
      return;
    }

    // Validate request body
    const validatedData = swapResponseSchema.parse(req.body);
    const { accept } = validatedData;

    // Get swap request
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: requestId },
      include: {
        requesterSlot: true,
        recipientSlot: true,
      },
    });

    if (!swapRequest) {
      res.status(404).json({ error: 'Swap request not found' });
      return;
    }

    // Check if user is the recipient
    if (swapRequest.recipientId !== req.user.id) {
      res.status(403).json({ error: 'You are not authorized to respond to this request' });
      return;
    }

    // Check if request is still pending
    if (swapRequest.status !== 'PENDING') {
      res.status(400).json({ error: `This swap request has already been ${swapRequest.status.toLowerCase()}` });
      return;
    }

    let updatedEvents = null;

    if (accept) {
      // ACCEPT: Swap the userId between the two events
      const result = await prisma.$transaction(async (tx) => {
        const { requesterSlot, recipientSlot } = swapRequest;

        // Swap the userId (ownership) of the two events
        const [updatedRequesterSlot, updatedRecipientSlot] = await Promise.all([
          tx.event.update({
            where: { id: requesterSlot.id },
            data: {
              userId: recipientSlot.userId, // Give requester's slot to recipient
              status: 'BUSY', // Reset to BUSY after swap
            },
          }),
          tx.event.update({
            where: { id: recipientSlot.id },
            data: {
              userId: requesterSlot.userId, // Give recipient's slot to requester
              status: 'BUSY', // Reset to BUSY after swap
            },
          }),
        ]);

        // Update swap request status
        const updatedSwapRequest = await tx.swapRequest.update({
          where: { id: requestId },
          data: { status: 'ACCEPTED' },
          include: {
            requester: {
              select: { id: true, name: true, email: true },
            },
            recipient: {
              select: { id: true, name: true, email: true },
            },
            requesterSlot: true,
            recipientSlot: true,
          },
        });

        return {
          swapRequest: updatedSwapRequest,
          events: [updatedRequesterSlot, updatedRecipientSlot],
        };
      });

      updatedEvents = result.events;

      // Emit WebSocket event to requester
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${swapRequest.requesterId}`).emit('swap:request:accepted', {
          swapRequest: result.swapRequest,
          message: `${req.user.name} accepted your swap request`,
          events: updatedEvents,
        });
      }

      res.status(200).json({
        message: 'Swap request accepted successfully',
        swapRequest: result.swapRequest,
        updatedEvents,
      });
    } else {
      // REJECT: Reset both slots to SWAPPABLE
      const result = await prisma.$transaction(async (tx) => {
        // Reset both slots to SWAPPABLE
        await Promise.all([
          tx.event.update({
            where: { id: swapRequest.requesterSlotId },
            data: { status: 'SWAPPABLE' },
          }),
          tx.event.update({
            where: { id: swapRequest.recipientSlotId },
            data: { status: 'SWAPPABLE' },
          }),
        ]);

        // Update swap request status
        const updatedSwapRequest = await tx.swapRequest.update({
          where: { id: requestId },
          data: { status: 'REJECTED' },
          include: {
            requester: {
              select: { id: true, name: true, email: true },
            },
            recipient: {
              select: { id: true, name: true, email: true },
            },
            requesterSlot: true,
            recipientSlot: true,
          },
        });

        return updatedSwapRequest;
      });

      // Emit WebSocket event to requester
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${swapRequest.requesterId}`).emit('swap:request:rejected', {
          swapRequest: result,
          message: `${req.user.name} rejected your swap request`,
        });
      }

      res.status(200).json({
        message: 'Swap request rejected',
        swapRequest: result,
      });
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }
    console.error('Respond to swap request error:', error);
    res.status(500).json({ error: 'Failed to process swap response' });
  }
};
