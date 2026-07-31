import api from './api.js';

/**
 * Ask the AI code assistant a question about the project code.
 *
 * @param {string} question - User question
 * @param {Array<{path: string, content: string}>} projectFiles - Array of project files
 * @returns {Promise<string>} - AI answer text
 */
export const askAssistant = async (question, projectFiles = []) => {
  const response = await api.post('/assistant/ask', {
    question,
    projectFiles,
  });
  return response.data.answer;
};
