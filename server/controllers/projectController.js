const crypto = require('crypto');
const Project = require('../models/Project');
const ScopeItem = require('../models/ScopeItem');
const ClientRequest = require('../models/ClientRequest');
const ChangeOrder = require('../models/ChangeOrder');
const AppError = require('../utils/AppError');

const generatePortalToken = () => crypto.randomBytes(32).toString('hex');

const assertOwnedProject = async (projectId, freelancerId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }
  if (String(project.freelancerId) !== String(freelancerId)) {
    throw new AppError('You do not have access to this project', 403, 'FORBIDDEN');
  }
  return project;
};

const parseHourlyRate = (value) => {
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate <= 0 || rate > 100000) {
    throw new AppError(
      'Hourly rate must be a number greater than 0 and at most 100000',
      400,
      'VALIDATION_ERROR'
    );
  }
  return rate;
};

const validateProjectInput = ({ title, clientName, hourlyRate }, partial = false) => {
  const data = {};

  if (!partial || title !== undefined) {
    const trimmed = typeof title === 'string' ? title.trim() : '';
    if (!trimmed || trimmed.length < 3 || trimmed.length > 100) {
      throw new AppError(
        'Title is required and must be between 3 and 100 characters',
        400,
        'VALIDATION_ERROR'
      );
    }
    data.title = trimmed;
  }

  if (!partial || clientName !== undefined) {
    const trimmed = typeof clientName === 'string' ? clientName.trim() : '';
    if (!trimmed || trimmed.length < 2 || trimmed.length > 100) {
      throw new AppError(
        'Client name is required and must be between 2 and 100 characters',
        400,
        'VALIDATION_ERROR'
      );
    }
    data.clientName = trimmed;
  }

  if (!partial || hourlyRate !== undefined) {
    data.hourlyRate = parseHourlyRate(hourlyRate);
  }

  return data;
};

const listProjects = async (req, res) => {
  const projects = await Project.find({ freelancerId: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ projects });
};

const createProject = async (req, res) => {
  const data = validateProjectInput(req.body);
  const project = await Project.create({
    ...data,
    freelancerId: req.user._id,
    portalToken: generatePortalToken(),
    status: 'active',
    totalPrice: 0,
    totalHours: 0,
  });
  res.status(201).json({ project });
};

const getProject = async (req, res) => {
  const project = await assertOwnedProject(req.params.id, req.user._id);
  res.json({ project });
};

const updateProject = async (req, res) => {
  const project = await assertOwnedProject(req.params.id, req.user._id);
  const data = validateProjectInput(req.body, true);

  if (data.title !== undefined) project.title = data.title;
  if (data.clientName !== undefined) project.clientName = data.clientName;
  if (data.hourlyRate !== undefined) project.hourlyRate = data.hourlyRate;

  await project.save();
  res.json({ project });
};

const deleteProject = async (req, res) => {
  const project = await assertOwnedProject(req.params.id, req.user._id);

  await ScopeItem.deleteMany({ projectId: project._id });
  await ClientRequest.deleteMany({ projectId: project._id });
  await ChangeOrder.deleteMany({ projectId: project._id });
  await Project.deleteOne({ _id: project._id });

  res.json({ message: 'Project deleted' });
};

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  assertOwnedProject,
};
