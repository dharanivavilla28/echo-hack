import api from './api.js';

export const getInvitations = async () => (await api.get('/team/invitations')).data.data;
export const respondToInvitation = async (teamId, status) => (await api.put(`/team/invitations/${teamId}`, { status })).data.data;
