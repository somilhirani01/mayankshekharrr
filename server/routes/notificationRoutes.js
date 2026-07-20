const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(notificationController.listNotifications));
router.put('/:id/read', asyncHandler(notificationController.markNotificationRead));

module.exports = router;
