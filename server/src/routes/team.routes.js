import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { createTeamProject, getTeam, updateMembers, getInvitations, respondToInvitation } from '../controllers/team.controller.js';
import { requireProjectPermission } from '../middleware/projectPermission.middleware.js';

const router = Router();
router.use(authenticate);
router.post('/projects', createTeamProject);
router.get('/invitations', getInvitations);
router.patch('/invitations/:teamId', respondToInvitation);
router.get('/projects/:projectId', requireProjectPermission('viewer'), getTeam);
router.put('/projects/:projectId/members', requireProjectPermission('owner'), updateMembers);
export default router;
