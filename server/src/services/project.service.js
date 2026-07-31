import Project from '../models/Project.model.js';
import ProjectTeam from '../models/ProjectTeam.model.js';

const accessProject = async (projectId, userId, roles = ['viewer', 'editor', 'owner']) => {
  const owned = await Project.findOne({ _id: projectId, userId });
  if (owned) return { project: owned, role: 'owner' };
  const team = await ProjectTeam.findOne({ projectId, members: { $elemMatch: { userId, status: 'accepted', role: { $in: roles.filter((role) => role !== 'owner') } } } });
  if (!team) return null;
  const member = team.members.find((item) => item.userId?.equals(userId) && item.status === 'accepted');
  return member && roles.includes(member.role) ? { project: await Project.findById(projectId), role: member.role } : null;
};

export const getUserProjects = async (userId) => {
  const teams = await ProjectTeam.find({ members: { $elemMatch: { userId, status: 'accepted' } } }).select('projectId');
  const projects = await Project.find({ $or: [{ userId }, { _id: { $in: teams.map((team) => team.projectId) } }] }).sort({ updatedAt: -1 });
  return projects;
};

export const getProjectById = async (projectId, userId) => {
  const access = await accessProject(projectId, userId);
  if (!access?.project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  return access.project;
};

export const createProject = async (userId, title) => {
  const project = await Project.create({
    userId,
    title: title || 'Untitled Project',
    messages: [],
    generatedCode: '',
    versions: [],
  });
  return project;
};

export const updateProject = async (projectId, userId, updates) => {
  const access = await accessProject(projectId, userId, ['editor', 'owner']);
  const project = access?.project;
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (updates.title !== undefined) project.title = updates.title;
  if (updates.description !== undefined) project.description = updates.description;

  project.updatedAt = new Date();
  await project.save();
  return project;
};

export const deleteProject = async (projectId, userId) => {
  const project = await Project.findOneAndDelete({ _id: projectId, userId });
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Project deleted successfully.' };
};

export const updateProjectCode = async (projectId, userId, code) => {
  const access = await accessProject(projectId, userId, ['editor', 'owner']);
  const project = access?.project;
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  // Push previous code to versions before overwriting
  if (project.generatedCode && project.generatedCode !== code) {
    project.versions.push({
      code: project.generatedCode,
      prompt: 'Manual edit',
      createdAt: new Date(),
    });
  }

  project.generatedCode = code;
  project.updatedAt = new Date();
  await project.save();
  return { generatedCode: project.generatedCode };
};

export const getProjectCode = async (projectId, userId) => {
  const access = await accessProject(projectId, userId);
  const project = access?.project;
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  return { generatedCode: project.generatedCode };
};
