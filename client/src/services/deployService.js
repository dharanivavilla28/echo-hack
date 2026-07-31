import api from './api.js';

export const deployProject = async (projectId, payload) => {
  const response = await api.post(`/deploy/${projectId}`, payload);
  return response.data.data;
};

export const getDeployStatus = async (projectId) => {
  const response = await api.get(`/deploy/${projectId}/status`);
  return response.data.data;
};
