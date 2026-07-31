import { getProjectRole } from '../services/team.service.js';

const hierarchy = { viewer: 1, editor: 2, owner: 3 };

export const requireProjectPermission = (minimumRole = 'viewer') => async (req, res, next) => {
  try {
    const access = await getProjectRole(req.params.projectId || req.params.id, req.user);
    if (!access || hierarchy[access.role] < hierarchy[minimumRole]) {
      return res.status(403).json({ success: false, message: 'You do not have permission for this action.' });
    }
    req.projectRole = access.role;
    req.projectTeam = access.team;
    next();
  } catch (error) {
    next(error);
  }
};
