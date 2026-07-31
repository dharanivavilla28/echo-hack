import * as teamService from '../services/team.service.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createTeamProject = async (req, res, next) => {
  try {
    const { title, members = [] } = req.body;
    if (!Array.isArray(members) || members.some((member) => !member.email || !emailPattern.test(member.email))) {
      return res.status(400).json({ success: false, message: 'Each invitation needs a valid email address.' });
    }
    const result = await teamService.createTeamProject(req.user, { title, members });
    return res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getTeam = async (req, res, next) => {
  try { return res.json({ success: true, data: await teamService.getTeam(req.params.projectId, req.user) }); } catch (error) { if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message }); next(error); }
};

export const updateMembers = async (req, res, next) => {
  try { return res.json({ success: true, data: await teamService.updateMembers(req.params.projectId, req.user, req.body.members || []) }); } catch (error) { if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message }); next(error); }
};

export const getInvitations = async (req, res, next) => {
  try { return res.json({ success: true, data: await teamService.getInvitations(req.user) }); } catch (error) { next(error); }
};

export const respondToInvitation = async (req, res, next) => {
  try {
    const status = req.body.status;
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid invitation response.' });
    return res.json({ success: true, data: await teamService.respondToInvitation(req.params.teamId, req.user, status) });
  } catch (error) { if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message }); next(error); }
};
