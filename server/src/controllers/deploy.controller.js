import * as deployService from '../services/deploy.service.js';
import Project from '../models/Project.model.js';

export const deployProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { repoName, githubToken, vercelToken } = req.body;

    const result = await deployService.executeDeployment(projectId, req.user._id, {
      repoName,
      githubToken,
      vercelToken,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const getDeployStatus = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, userId: req.user._id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        githubRepo: project.githubRepo || '',
        deployUrl: project.deployUrl || '',
        deployStatus: project.deployStatus || 'idle',
      },
    });
  } catch (error) {
    next(error);
  }
};
