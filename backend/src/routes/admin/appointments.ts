import { Router } from 'express';
import {
  getAppointments,
  getCalendarAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../../controllers/admin/appointments.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.js';

const router = Router();

// All routes are protected
router.use(adminAuthMiddleware);

router.get('/', getAppointments);
router.get('/calendar', getCalendarAppointments);
router.get('/:id', getAppointment);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
