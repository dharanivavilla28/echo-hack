import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { deployProject, getDeployStatus } from '../controllers/deploy.controller.js';

const router = Router();

router.use(authenticate);

router.post('/:projectId', deployProject);
router.get('/:projectId/status', getDeployStatus);

export default router;
