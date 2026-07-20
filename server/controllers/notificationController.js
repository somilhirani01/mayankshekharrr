const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

const listNotifications = async (req, res) => {
  const notifications = await Notification.find({
    freelancerId: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ notifications });
};

const markNotificationRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOT_FOUND');
  }

  if (String(notification.freelancerId) !== String(req.user._id)) {
    throw new AppError('You do not have access to this notification', 403, 'FORBIDDEN');
  }

  notification.isRead = true;
  await notification.save();

  res.json({ notification });
};

module.exports = {
  listNotifications,
  markNotificationRead,
};
