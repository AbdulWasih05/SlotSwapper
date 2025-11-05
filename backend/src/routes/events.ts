import { Router } from 'express';
import {
  getUserEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
} from '../controllers/events.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All event routes require authentication
router.use(authMiddleware);

router.get('/', getUserEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.patch('/:id/status', toggleEventStatus);

export default router;
