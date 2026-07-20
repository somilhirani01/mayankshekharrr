const ScopeItem = require('../models/ScopeItem');
const ClientRequest = require('../models/ClientRequest');
const AppError = require('../utils/AppError');
const { assertOwnedProject } = require('./projectController');

const TAG_REGEX = /^[a-z0-9-]{2,30}$/;

const validateScopeInput = ({ title, description, categoryTag, estimatedHours }, partial = false) => {
  const data = {};

  if (!partial || title !== undefined) {
    const trimmed = typeof title === 'string' ? title.trim() : '';
    if (!trimmed || trimmed.length < 3 || trimmed.length > 150) {
      throw new AppError(
        'Scope item title is required and must be between 3 and 150 characters',
        400,
        'VALIDATION_ERROR'
      );
    }
    data.title = trimmed;
  }

  if (!partial || description !== undefined) {
    if (description === undefined || description === null) {
      data.description = '';
    } else if (typeof description !== 'string') {
      throw new AppError('Description must be a string', 400, 'VALIDATION_ERROR');
    } else {
      data.description = description.trim();
    }
  }

  if (!partial || categoryTag !== undefined) {
    const tag =
      typeof categoryTag === 'string' ? categoryTag.trim().toLowerCase() : '';
    if (!TAG_REGEX.test(tag)) {
      throw new AppError(
        'Category tag must be 2 to 30 characters and use only lowercase letters, numbers, and hyphens',
        400,
        'VALIDATION_ERROR'
      );
    }
    data.categoryTag = tag;
  }

  if (!partial || estimatedHours !== undefined) {
    const hours = Number(estimatedHours);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 500) {
      throw new AppError(
        'Estimated hours must be a number greater than 0 and at most 500',
        400,
        'VALIDATION_ERROR'
      );
    }
    data.estimatedHours = hours;
  }

  return data;
};

const hasLinkedChangeOrder = async (projectId, categoryTag) => {
  const linked = await ClientRequest.findOne({
    projectId,
    categoryTag,
    changeOrderId: { $ne: null },
  });
  return Boolean(linked);
};

const listScopeItems = async (req, res) => {
  await assertOwnedProject(req.params.id, req.user._id);
  const scopeItems = await ScopeItem.find({ projectId: req.params.id }).sort({
    createdAt: 1,
  });
  res.json({ scopeItems });
};

const createScopeItem = async (req, res) => {
  await assertOwnedProject(req.params.id, req.user._id);
  const data = validateScopeInput(req.body);

  const scopeItem = await ScopeItem.create({
    projectId: req.params.id,
    ...data,
  });

  res.status(201).json({ scopeItem });
};

const updateScopeItem = async (req, res) => {
  const scopeItem = await ScopeItem.findById(req.params.id);
  if (!scopeItem) {
    throw new AppError('Scope item not found', 404, 'NOT_FOUND');
  }

  await assertOwnedProject(scopeItem.projectId, req.user._id);
  const data = validateScopeInput(req.body, true);

  if (data.title !== undefined) scopeItem.title = data.title;
  if (data.description !== undefined) scopeItem.description = data.description;
  if (data.categoryTag !== undefined) scopeItem.categoryTag = data.categoryTag;
  if (data.estimatedHours !== undefined) {
    scopeItem.estimatedHours = data.estimatedHours;
  }

  await scopeItem.save();
  res.json({ scopeItem });
};

const deleteScopeItem = async (req, res) => {
  const scopeItem = await ScopeItem.findById(req.params.id);
  if (!scopeItem) {
    throw new AppError('Scope item not found', 404, 'NOT_FOUND');
  }

  await assertOwnedProject(scopeItem.projectId, req.user._id);

  const linked = await hasLinkedChangeOrder(
    scopeItem.projectId,
    scopeItem.categoryTag
  );
  if (linked) {
    throw new AppError(
      'Cannot delete a scope item that has a linked change order',
      409,
      'CONFLICT'
    );
  }

  await ScopeItem.deleteOne({ _id: scopeItem._id });
  res.json({ message: 'Scope item deleted' });
};

module.exports = {
  listScopeItems,
  createScopeItem,
  updateScopeItem,
  deleteScopeItem,
};
