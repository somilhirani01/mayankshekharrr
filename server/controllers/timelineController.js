const ScopeItem = require('../models/ScopeItem');
const ChangeOrder = require('../models/ChangeOrder');
const { assertOwnedProject } = require('./projectController');
const { findProjectByPortalToken } = require('./requestController');

const buildTimeline = async (projectId, { simplified = false } = {}) => {
  const [scopeItems, approvedOrders] = await Promise.all([
    ScopeItem.find({ projectId }).sort({ createdAt: 1 }),
    ChangeOrder.find({ projectId, status: 'approved' }).sort({ resolvedAt: 1 }),
  ]);

  const entries = [];

  for (const item of scopeItems) {
    if (simplified) {
      entries.push({
        type: 'scope_item',
        id: item._id,
        title: item.title,
        hours: item.estimatedHours,
        price: null,
        createdAt: item.createdAt,
      });
    } else {
      entries.push({
        type: 'scope_item',
        id: item._id,
        title: item.title,
        description: item.description,
        categoryTag: item.categoryTag,
        hours: item.estimatedHours,
        price: null,
        createdAt: item.createdAt,
      });
    }
  }

  for (const order of approvedOrders) {
    const timestamp = order.resolvedAt || order.createdAt;
    if (simplified) {
      entries.push({
        type: 'change_order',
        id: order._id,
        title: order.description,
        hours: order.estimatedHours,
        price: order.price,
        createdAt: timestamp,
      });
    } else {
      entries.push({
        type: 'change_order',
        id: order._id,
        title: order.description,
        description: order.description,
        hours: order.estimatedHours,
        price: order.price,
        isBlocking: order.isBlocking,
        status: order.status,
        createdAt: timestamp,
        resolvedAt: order.resolvedAt,
      });
    }
  }

  entries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return entries;
};

const getProjectTimeline = async (req, res) => {
  await assertOwnedProject(req.params.id, req.user._id);
  const timeline = await buildTimeline(req.params.id, { simplified: false });
  res.json({ timeline });
};

const getPortalTimeline = async (req, res) => {
  const project = await findProjectByPortalToken(req.params.token);
  const timeline = await buildTimeline(project._id, { simplified: true });
  res.json({
    timeline,
    totals: {
      totalPrice: project.totalPrice,
      totalHours: project.totalHours,
    },
  });
};

module.exports = {
  getProjectTimeline,
  getPortalTimeline,
  buildTimeline,
};
