import { Router } from 'express';
import { adminLogin, getCurrentAdmin, seedAdmin } from '../../controllers/admin/auth.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.js';

const router = Router();

// Public routes
router.post('/login', adminLogin);
router.post('/seed', seedAdmin);

// Protected routes
router.get('/me', adminAuthMiddleware, getCurrentAdmin);

export default router;
