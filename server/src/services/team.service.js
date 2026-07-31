import Project from '../models/Project.model.js';
import ProjectTeam from '../models/ProjectTeam.model.js';

const createError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const normaliseEmail = (email) => email.trim().toLowerCase();

export const getProjectRole = async (projectId, user) => {
  const team = await ProjectTeam.findOne({ projectId });
  if (!team) {
    const project = await Project.findOne({ _id: projectId, userId: user._id });
    return project ? { role: 'owner', team: null } : null;
  }
  if (team.owner.equals(user._id)) return { role: 'owner', team };
  const member = team.members.find((item) => item.status === 'accepted' && item.email === user.email.toLowerCase());
  return member ? { role: member.role, team } : null;
};

export const createTeamProject = async (owner, { title, members = [] }) => {
  const unique = new Map();
  members.forEach((member) => {
    const email = normaliseEmail(member.email);
    if (email !== owner.email.toLowerCase()) unique.set(email, { email, role: member.role === 'viewer' ? 'viewer' : 'editor' });
  });
  const project = await Project.create({ userId: owner._id, title: title?.trim() || 'Untitled Project', messages: [], generatedCode: '', versions: [] });
  const team = await ProjectTeam.create({ projectId: project._id, owner: owner._id, members: [...unique.values()] });
  return { project, team };
};

export const getTeam = async (projectId, user) => {
  const access = await getProjectRole(projectId, user);
  if (!access) throw createError('You do not have access to this project.', 403);
  return { ...access, team: access.team && await access.team.populate('owner', 'name email') };
};

export const updateMembers = async (projectId, owner, members) => {
  const access = await getProjectRole(projectId, owner);
  if (!access || access.role !== 'owner' || !access.team) throw createError('Only the owner can manage members.', 403);
  const seen = new Set();
  const next = members.map((member) => {
    const email = normaliseEmail(member.email);
    if (!email || seen.has(email) || email === owner.email.toLowerCase()) throw createError('Members must have unique valid email addresses.', 400);
    seen.add(email);
    const existing = access.team.members.find((item) => item.email === email);
    return { email, role: member.role === 'viewer' ? 'viewer' : 'editor', status: existing?.status || 'pending', userId: existing?.userId || null };
  });
  access.team.members = next;
  await access.team.save();
  return access.team;
};

export const getInvitations = async (user) => ProjectTeam.find({ members: { $elemMatch: { email: user.email.toLowerCase(), status: 'pending' } } }).populate('projectId', 'title').populate('owner', 'name email');

export const respondToInvitation = async (teamId, user, status) => {
  const team = await ProjectTeam.findById(teamId);
  if (!team) throw createError('Invitation not found.', 404);
  const member = team.members.find((item) => item.email === user.email.toLowerCase() && item.status === 'pending');
  if (!member) throw createError('Invitation not found.', 404);
  member.status = status;
  member.userId = user._id;
  await team.save();
  return team;
};

export const addChatMessage = async (projectId, user, text) => {
  const access = await getProjectRole(projectId, user);
  if (!access?.team) throw createError('Project chat is available for team projects only.', 400);
  const message = { userId: user._id, name: user.name, text: text.trim() };
  access.team.chatMessages.push(message);
  if (access.team.chatMessages.length > 100) access.team.chatMessages.shift();
  await access.team.save();
  return access.team.chatMessages.at(-1);
};
