import { Router } from 'express';
import { getSettings, updateSettings, updateClinic } from '../../controllers/admin/settings.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.js';

const router = Router();

// All routes are protected
router.use(adminAuthMiddleware);

router.get('/', getSettings);
router.put('/', updateSettings);
router.put('/clinic', updateClinic);

export default router;
