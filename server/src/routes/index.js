import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import generationRoutes from './generation.routes.js';
import snapshotRoutes from './snapshot.routes.js';
import onboardingRoutes from './onboarding.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/projects', snapshotRoutes);
router.use('/generate', generationRoutes);
router.use('/onboarding', onboardingRoutes);

export default router;
