import { Router } from 'express';
import { importAppointments, getImportTemplate, downloadImportTemplate } from '../../controllers/admin/import.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.js';

const router = Router();

// All routes are protected
router.use(adminAuthMiddleware);

router.post('/appointments', importAppointments);
router.get('/template', getImportTemplate);
router.get('/template/download', downloadImportTemplate);

export default router;
