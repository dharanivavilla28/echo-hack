import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import generationRoutes from './generation.routes.js';
import deployRoutes from './deploy.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/generate', generationRoutes);
router.use('/deploy', deployRoutes);

export default router;