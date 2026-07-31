import api from './api.js';

const createSnapshot = async (projectId, code, prompt, message) => {
  const response = await api.post(`/projects/${projectId}/snapshots`, {
    code,
    prompt,
    message,
  });
  return response.data.snapshot;
};

const getSnapshots = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/snapshots`);
  return response.data.snapshots;
};

const restoreSnapshot = async (projectId, snapshotId) => {
  const response = await api.post(`/projects/${projectId}/restore/${snapshotId}`);
  return response.data.project;
};

const deleteSnapshot = async (projectId, snapshotId) => {
  const response = await api.delete(`/projects/${projectId}/snapshots/${snapshotId}`);
  return response.data;
};

const snapshotService = {
  createSnapshot,
  getSnapshots,
  restoreSnapshot,
  deleteSnapshot,
};

export { createSnapshot, getSnapshots, restoreSnapshot, deleteSnapshot, snapshotService };
