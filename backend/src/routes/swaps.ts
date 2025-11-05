import { Router } from 'express';
import {
  getSwappableSlots,
  createSwapRequest,
  getSwapRequests,
  respondToSwapRequest,
} from '../controllers/swaps.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All swap routes require authentication
router.use(authMiddleware);

router.get('/swappable-slots', getSwappableSlots);
router.post('/swap-request', createSwapRequest);
router.get('/swap-requests', getSwapRequests);
router.post('/swap-response/:requestId', respondToSwapRequest);

export default router;
