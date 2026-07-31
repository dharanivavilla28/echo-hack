import * as projectService from '../services/project.service.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user._id);
    return res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { title } = req.body;
    const project = await projectService.createProject(req.user._id, title);
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user._id);
    return res.json({ success: true, data: project });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const project = await projectService.updateProject(req.params.id, req.user._id, { title, description });
    return res.json({ success: true, data: project });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user._id);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updateProjectCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Code must be a string.' });
    }
    const result = await projectService.updateProjectCode(req.params.id, req.user._id, code);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const getProjectCode = async (req, res, next) => {
  try {
    const result = await projectService.getProjectCode(req.params.id, req.user._id);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};