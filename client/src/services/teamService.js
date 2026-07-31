import api from './api.js';

export const createTeamProject = async (data) => (await api.post('/team/projects', data)).data.data;
export const getProjectTeam = async (projectId) => (await api.get(`/team/projects/${projectId}`)).data.data;
export const updateTeamMembers = async (projectId, members) => (await api.put(`/team/projects/${projectId}/members`, { members })).data.data;
