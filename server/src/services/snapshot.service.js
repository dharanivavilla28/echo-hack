import mongoose from 'mongoose';
import Project from '../models/Project.model.js';

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createHttpError(`Invalid ${label}.`, 400);
  }
};

const findUserProject = async (projectId, userId) => {
  validateObjectId(projectId, 'project ID');

  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw createHttpError('Project not found.', 404);
  }

  return project;
};

export const createSnapshot = async (projectId, userId, { code, prompt, message }) => {
  if (typeof code !== 'string' || !code.trim()) {
    throw createHttpError('Snapshot code is required.', 400);
  }

  const project = await findUserProject(projectId, userId);
  const nextVersion = (project.currentVersion || 0) + 1;

  // Snapshots preserve a complete restorable code state without touching legacy versions.
  project.snapshots.push({
    code,
    prompt: typeof prompt === 'string' ? prompt : '',
    message: message && message.trim() ? message.trim() : 'Auto-snapshot',
    createdAt: new Date(),
    version: nextVersion,
  });
  project.currentVersion = nextVersion;
  project.updatedAt = new Date();

  await project.save();
  return project.snapshots[project.snapshots.length - 1];
};

export const getSnapshots = async (projectId, userId) => {
  const project = await findUserProject(projectId, userId);
  return project.snapshots || [];
};

export const restoreSnapshot = async (projectId, snapshotId, userId) => {
  validateObjectId(snapshotId, 'snapshot ID');

  const project = await findUserProject(projectId, userId);
  const snapshot = project.snapshots.id(snapshotId);

  if (!snapshot) {
    throw createHttpError('Snapshot not found.', 404);
  }

  snapshot.restoredAt = new Date();
  project.generatedCode = snapshot.code;
  project.currentVersion = snapshot.version || project.currentVersion;
  project.updatedAt = new Date();

  await project.save();
  return project;
};

export const deleteSnapshot = async (projectId, snapshotId, userId) => {
  validateObjectId(snapshotId, 'snapshot ID');

  const project = await findUserProject(projectId, userId);
  const snapshot = project.snapshots.id(snapshotId);

  if (!snapshot) {
    throw createHttpError('Snapshot not found.', 404);
  }

  snapshot.deleteOne();
  project.updatedAt = new Date();
  await project.save();

  return { message: 'Snapshot deleted' };
};
