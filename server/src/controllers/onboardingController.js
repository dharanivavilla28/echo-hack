import Project from '../models/Project.model.js';
import * as onboardingService from '../services/onboardingService.js';

export const getTypes = async (req, res, next) => {
  try {
    const types = onboardingService.getAllTypes();
    return res.json({ success: true, data: types });
  } catch (error) {
    next(error);
  }
};

export const configureProject = async (req, res, next) => {
  try {
    const { type, customPrompt } = req.body;
    const projectData = onboardingService.createProjectFromTemplate(req.user._id, type, customPrompt);
    const project = await Project.create(projectData);

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
