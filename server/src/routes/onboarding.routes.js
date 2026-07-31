import { Router } from 'express';
import { configureProject, getTypes } from '../controllers/onboardingController.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/types', getTypes);
router.post('/configure', configureProject);

export default router;
