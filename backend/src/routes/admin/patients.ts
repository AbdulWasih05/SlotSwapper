import { Router } from 'express';
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient
} from '../../controllers/admin/patients.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.js';

const router = Router();

// All routes are protected
router.use(adminAuthMiddleware);

router.get('/', getPatients);
router.get('/:id', getPatient);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
