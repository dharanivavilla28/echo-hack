import api from './api.js';

/**
 * Send a multi-turn chat message to the AI agent for a project.
 *
 * Calls: POST /api/projects/:projectId/chat
 * The backend reads the full conversation history from the database,
 * sends it to the AI, and returns the updated code + assistant reply.
 *
 * @param {string} projectId
 * @param {string} prompt - User message
 * @returns {Promise<{ message: Object, generatedCode: string, versionIndex: number }>}
 */
export const chatWithAgent = async (projectId, prompt) => {
  const response = await api.post(`/projects/${projectId}/chat`, { prompt });
  return response.data.data;
};
