import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

export default router;
