import * as codeAssistantService from '../services/codeAssistant.service.js';

export const askAssistant = async (req, res, next) => {
  try {
    const { question, projectFiles } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required.',
      });
    }

    const result = await codeAssistantService.askCodeAssistant(question.trim(), projectFiles || []);

    return res.status(200).json({
      success: true,
      answer: result.answer,
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
