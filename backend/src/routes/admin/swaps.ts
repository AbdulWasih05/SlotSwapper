import { Router } from 'express';
import {
  getSwapRequests,
  getPendingSwaps,
  approveSwap,
  rejectSwap
} from '../../controllers/admin/swaps.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.js';

const router = Router();

// All routes are protected
router.use(adminAuthMiddleware);

router.get('/', getSwapRequests);
router.get('/pending', getPendingSwaps);
router.post('/:id/approve', approveSwap);
router.post('/:id/reject', rejectSwap);

export default router;
