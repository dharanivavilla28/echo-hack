import api from './api.js';

const getTypes = async () => {
  const response = await api.get('/onboarding/types');
  return response.data.data;
};

const configureProject = async (type, customPrompt) => {
  const response = await api.post('/onboarding/configure', { type, customPrompt });
  return response.data.data;
};

export const onboardingService = {
  getTypes,
  configureProject,
};
