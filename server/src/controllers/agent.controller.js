import { orchestrateAgentChat } from '../services/agent/agentOrchestrator.service.js';

/**
 * POST /api/projects/:id/chat
 * Multi-turn agent chat for a project.
 */
export const agentChat = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a prompt.',
      });
    }

    const result = await orchestrateAgentChat(projectId, req.user._id, prompt.trim());

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
