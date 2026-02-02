import { Router } from 'express';
import { getDashboardStats, getRecentActivity } from '../../controllers/admin/dashboard.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.js';

const router = Router();

// All routes are protected
router.use(adminAuthMiddleware);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

export default router;
