const ClientRequest = require('../models/ClientRequest');
const ChangeOrder = require('../models/ChangeOrder');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { assertOwnedProject } = require('./projectController');
const { findProjectByPortalToken } = require('./requestController');

const ALLOWED_CREATE_CLASSIFICATIONS = new Set(['possible_extra', 'unclear']);

const parseHours = (value) => {
  const hours = Number(value);
  if (!Number.isFinite(hours) || hours <= 0 || hours > 500) {
    throw new AppError(
      'Estimated hours must be a number greater than 0 and at most 500',
      400,
      'VALIDATION_ERROR'
    );
  }
  return hours;
};

const computePrice = (hours, hourlyRate) => {
  return Math.round(hours * hourlyRate * 100) / 100;
};

const findPendingBlocking = async (projectId, excludeId = null) => {
  const query = {
    projectId,
    isBlocking: true,
    status: { $in: ['draft', 'sent'] },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return ChangeOrder.findOne(query);
};

const createChangeOrder = async (req, res) => {
  const request = await ClientRequest.findById(req.params.id);
  if (!request) {
    throw new AppError('Request not found', 404, 'NOT_FOUND');
  }

  const project = await assertOwnedProject(request.projectId, req.user._id);

  if (!ALLOWED_CREATE_CLASSIFICATIONS.has(request.classification)) {
    throw new AppError(
      'Change orders can only be created from possible_extra or unclear requests',
      409,
      'CONFLICT'
    );
  }

  if (request.changeOrderId) {
    throw new AppError(
      'This request already has a change order',
      409,
      'CONFLICT'
    );
  }

  const existingForRequest = await ChangeOrder.findOne({ requestId: request._id });
  if (existingForRequest) {
    throw new AppError(
      'This request already has a change order',
      409,
      'CONFLICT'
    );
  }

  const estimatedHours = parseHours(
    req.body.estimatedHours !== undefined ? req.body.estimatedHours : 1
  );
  const isBlocking = Boolean(req.body.isBlocking);
  const description =
    typeof req.body.description === 'string' && req.body.description.trim()
      ? req.body.description.trim()
      : request.requestText;

  if (description.length < 3) {
    throw new AppError(
      'Description must be at least 3 characters',
      400,
      'VALIDATION_ERROR'
    );
  }

  if (isBlocking) {
    const pending = await findPendingBlocking(project._id);
    if (pending) {
      throw new AppError(
        'A blocking change order is already pending on this project',
        409,
        'CONFLICT'
      );
    }
  }

  const price = computePrice(estimatedHours, project.hourlyRate);

  const changeOrder = await ChangeOrder.create({
    projectId: project._id,
    requestId: request._id,
    description,
    estimatedHours,
    price,
    isBlocking,
    status: 'draft',
    resolvedAt: null,
  });

  request.changeOrderId = changeOrder._id;
  await request.save();

  if (isBlocking) {
    project.status = 'paused';
    await project.save();
  }

  res.status(201).json({ changeOrder });
};

const listChangeOrders = async (req, res) => {
  await assertOwnedProject(req.params.id, req.user._id);
  const changeOrders = await ChangeOrder.find({ projectId: req.params.id }).sort({
    createdAt: -1,
  });
  res.json({ changeOrders });
};

const updateDraftChangeOrder = async (req, res) => {
  const changeOrder = await ChangeOrder.findById(req.params.id);
  if (!changeOrder) {
    throw new AppError('Change order not found', 404, 'NOT_FOUND');
  }

  const project = await assertOwnedProject(changeOrder.projectId, req.user._id);

  if (changeOrder.status !== 'draft') {
    throw new AppError(
      'Only draft change orders can be edited',
      409,
      'CONFLICT'
    );
  }

  if (req.body.estimatedHours !== undefined) {
    changeOrder.estimatedHours = parseHours(req.body.estimatedHours);
    changeOrder.price = computePrice(changeOrder.estimatedHours, project.hourlyRate);
  }

  if (req.body.description !== undefined) {
    const description =
      typeof req.body.description === 'string' ? req.body.description.trim() : '';
    if (description.length < 3) {
      throw new AppError(
        'Description must be at least 3 characters',
        400,
        'VALIDATION_ERROR'
      );
    }
    changeOrder.description = description;
  }

  if (req.body.isBlocking !== undefined) {
    const nextBlocking = Boolean(req.body.isBlocking);
    if (nextBlocking && !changeOrder.isBlocking) {
      const pending = await findPendingBlocking(project._id, changeOrder._id);
      if (pending) {
        throw new AppError(
          'A blocking change order is already pending on this project',
          409,
          'CONFLICT'
        );
      }
      project.status = 'paused';
      await project.save();
    }
    if (!nextBlocking && changeOrder.isBlocking) {
      const otherPending = await findPendingBlocking(project._id, changeOrder._id);
      if (!otherPending) {
        project.status = 'active';
        await project.save();
      }
    }
    changeOrder.isBlocking = nextBlocking;
  }

  await changeOrder.save();
  res.json({ changeOrder });
};

const sendChangeOrder = async (req, res) => {
  const changeOrder = await ChangeOrder.findById(req.params.id);
  if (!changeOrder) {
    throw new AppError('Change order not found', 404, 'NOT_FOUND');
  }

  const project = await assertOwnedProject(changeOrder.projectId, req.user._id);

  if (changeOrder.status !== 'draft') {
    throw new AppError(
      'Only draft change orders can be sent',
      409,
      'CONFLICT'
    );
  }

  if (req.body.estimatedHours !== undefined) {
    changeOrder.estimatedHours = parseHours(req.body.estimatedHours);
    changeOrder.price = computePrice(changeOrder.estimatedHours, project.hourlyRate);
  }

  changeOrder.status = 'sent';
  await changeOrder.save();

  res.json({ changeOrder });
};

const approveChangeOrder = async (req, res) => {
  const project = await findProjectByPortalToken(req.params.token);
  const changeOrder = await ChangeOrder.findById(req.params.id);

  if (!changeOrder || String(changeOrder.projectId) !== String(project._id)) {
    throw new AppError('Change order not found', 404, 'NOT_FOUND');
  }

  if (changeOrder.status !== 'sent') {
    throw new AppError(
      'Only sent change orders can be approved',
      409,
      'CONFLICT'
    );
  }

  changeOrder.status = 'approved';
  changeOrder.resolvedAt = new Date();
  await changeOrder.save();

  project.totalPrice =
    Math.round((project.totalPrice + changeOrder.price) * 100) / 100;
  project.totalHours =
    Math.round((project.totalHours + changeOrder.estimatedHours) * 100) / 100;

  if (changeOrder.isBlocking) {
    project.status = 'active';
  }
  await project.save();

  await Notification.create({
    freelancerId: project.freelancerId,
    projectId: project._id,
    message: `Client approved a change order on "${project.title}"`,
    isRead: false,
  });

  res.json({ changeOrder, project });
};

const declineChangeOrder = async (req, res) => {
  const project = await findProjectByPortalToken(req.params.token);
  const changeOrder = await ChangeOrder.findById(req.params.id);

  if (!changeOrder || String(changeOrder.projectId) !== String(project._id)) {
    throw new AppError('Change order not found', 404, 'NOT_FOUND');
  }

  if (changeOrder.status !== 'sent') {
    throw new AppError(
      'Only sent change orders can be declined',
      409,
      'CONFLICT'
    );
  }

  changeOrder.status = 'declined';
  changeOrder.resolvedAt = new Date();
  await changeOrder.save();

  if (changeOrder.isBlocking) {
    project.status = 'active';
    await project.save();
  }

  await Notification.create({
    freelancerId: project.freelancerId,
    projectId: project._id,
    message: `Client declined a change order on "${project.title}"`,
    isRead: false,
  });

  res.json({ changeOrder });
};

const getChangeOrder = async (req, res) => {
  const changeOrder = await ChangeOrder.findById(req.params.id);
  if (!changeOrder) {
    throw new AppError('Change order not found', 404, 'NOT_FOUND');
  }
  await assertOwnedProject(changeOrder.projectId, req.user._id);
  res.json({ changeOrder });
};

module.exports = {
  createChangeOrder,
  listChangeOrders,
  updateDraftChangeOrder,
  sendChangeOrder,
  approveChangeOrder,
  declineChangeOrder,
  getChangeOrder,
};
