const Project = require('../models/Project');
const ScopeItem = require('../models/ScopeItem');
const ClientRequest = require('../models/ClientRequest');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { classifyRequest } = require('../utils/matchEngine');
const { assertOwnedProject } = require('./projectController');

const findProjectByPortalToken = async (token) => {
  if (!token || typeof token !== 'string' || token.length < 48) {
    throw new AppError('Portal not found', 404, 'NOT_FOUND');
  }

  const project = await Project.findOne({ portalToken: token });
  if (!project) {
    throw new AppError('Portal not found', 404, 'NOT_FOUND');
  }

  return project;
};

const getPortalProject = async (req, res) => {
  const project = await findProjectByPortalToken(req.params.token);
  const scopeItems = await ScopeItem.find({ projectId: project._id }).select(
    'title categoryTag estimatedHours'
  );

  const categoryTags = [
    ...new Set(scopeItems.map((item) => item.categoryTag).filter(Boolean)),
  ].sort();

  res.json({
    project: {
      id: project._id,
      title: project.title,
      clientName: project.clientName,
      status: project.status,
      totalPrice: project.totalPrice,
      totalHours: project.totalHours,
    },
    categoryTags,
  });
};

const submitPortalRequest = async (req, res) => {
  const project = await findProjectByPortalToken(req.params.token);
  const requestText =
    typeof req.body.requestText === 'string' ? req.body.requestText.trim() : '';

  if (!requestText || requestText.length < 10 || requestText.length > 2000) {
    throw new AppError(
      'Request text is required and must be between 10 and 2000 characters',
      400,
      'VALIDATION_ERROR'
    );
  }

  const scopeItems = await ScopeItem.find({ projectId: project._id });
  const existingTags = new Set(
    scopeItems.map((item) => String(item.categoryTag).toLowerCase())
  );

  let categoryTag = null;
  if (
    req.body.categoryTag !== undefined &&
    req.body.categoryTag !== null &&
    String(req.body.categoryTag).trim() !== ''
  ) {
    categoryTag = String(req.body.categoryTag).trim().toLowerCase();
    if (!existingTags.has(categoryTag)) {
      throw new AppError(
        'Category tag must match an existing scope item tag on this project',
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  const classification = classifyRequest(requestText, categoryTag, scopeItems);

  const clientRequest = await ClientRequest.create({
    projectId: project._id,
    requestText,
    categoryTag,
    classification,
    changeOrderId: null,
  });

  await Notification.create({
    freelancerId: project.freelancerId,
    projectId: project._id,
    message: `New client request on "${project.title}" classified as ${classification.replace(
      '_',
      ' '
    )}`,
    isRead: false,
  });

  res.status(201).json({
    request: {
      id: clientRequest._id,
      requestText: clientRequest.requestText,
      categoryTag: clientRequest.categoryTag,
      classification: clientRequest.classification,
      createdAt: clientRequest.createdAt,
    },
  });
};

const listProjectRequests = async (req, res) => {
  await assertOwnedProject(req.params.id, req.user._id);
  const requests = await ClientRequest.find({ projectId: req.params.id }).sort({
    createdAt: -1,
  });
  res.json({ requests });
};

module.exports = {
  getPortalProject,
  submitPortalRequest,
  listProjectRequests,
  findProjectByPortalToken,
};
