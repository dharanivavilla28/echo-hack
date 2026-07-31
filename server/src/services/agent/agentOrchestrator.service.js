import { generateCode } from '../generation.service.js';

/**
 * Orchestrates a multi-turn agent chat session.
 *
 * Reuses the existing generation.service.js which already:
 *   1. Reads project.messages history
 *   2. Builds a full conversation (system + history + current code + new prompt)
 *   3. Calls askGrok() for the AI response
 *   4. Appends user + assistant messages and saves to DB
 *
 * @param {string} projectId
 * @param {string} userId
 * @param {string} userPrompt
 * @returns {Promise<{ message: Object, generatedCode: string, versionIndex: number }>}
 */
export const orchestrateAgentChat = async (projectId, userId, userPrompt) => {
  if (!userPrompt || !userPrompt.trim()) {
    const error = new Error('Prompt cannot be empty.');
    error.statusCode = 400;
    throw error;
  }

  // Delegate fully to the existing generation service which handles:
  // - loading project + conversation history
  // - building multi-turn prompt
  // - calling AI
  // - parsing code
  // - persisting messages + generatedCode to MongoDB
  const result = await generateCode(projectId, userId, userPrompt.trim());

  return result;
};
