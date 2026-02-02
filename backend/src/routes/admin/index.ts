import { Router } from 'express';
import authRoutes from './auth.js';
import dashboardRoutes from './dashboard.js';
import patientsRoutes from './patients.js';
import appointmentsRoutes from './appointments.js';
import swapsRoutes from './swaps.js';
import settingsRoutes from './settings.js';
import importRoutes from './import.js';

const router = Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Admin Routes] ${req.method} ${req.path}`);
  next();
});

// Mount admin sub-routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/patients', patientsRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/swaps', swapsRoutes);
router.use('/settings', settingsRoutes);
router.use('/import', importRoutes);

export default router;
