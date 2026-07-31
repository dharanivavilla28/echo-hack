import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { deployProject, getDeployStatus } from '../controllers/deploy.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/:projectId', deployProject);
router.get('/:projectId/status', getDeployStatus);

export default router;
