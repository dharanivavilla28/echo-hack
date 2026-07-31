import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import generationRoutes from './generation.routes.js';
import snapshotRoutes from './snapshot.routes.js';
import teamRoutes from './team.routes.js';
import deployRoutes from './deploy.routes.js';
import assistantRoutes from './assistant.routes.js';
import agentRoutes from './agent.routes.js';
import onboardingRoutes from './onboarding.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/projects', snapshotRoutes);
router.use('/projects', agentRoutes);
router.use('/generate', generationRoutes);
router.use('/team', teamRoutes);
router.use('/deploy', deployRoutes);
router.use('/assistant', assistantRoutes);
router.use('/onboarding', onboardingRoutes);

export default router;
