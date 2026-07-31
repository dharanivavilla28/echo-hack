import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { agentChat } from '../controllers/agent.controller.js';

const router = Router();

router.use(authenticate);

// POST /api/projects/:id/chat → multi-turn agent conversation
router.post('/:id/chat', agentChat);

export default router;
