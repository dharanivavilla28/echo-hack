export const canEditProject = (role) => role === 'owner' || role === 'editor';
export const canManageTeam = (role) => role === 'owner';
