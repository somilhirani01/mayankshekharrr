const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const portalRateLimit = require('../middleware/portalRateLimit');
const requestController = require('../controllers/requestController');
const timelineController = require('../controllers/timelineController');

const router = express.Router();

router.get(
  '/portal/:token',
  asyncHandler(requestController.getPortalProject)
);
router.post(
  '/portal/:token/requests',
  portalRateLimit,
  asyncHandler(requestController.submitPortalRequest)
);
router.get(
  '/portal/:token/timeline',
  asyncHandler(timelineController.getPortalTimeline)
);

router.get(
  '/projects/:id/requests',
  authMiddleware,
  asyncHandler(requestController.listProjectRequests)
);

module.exports = router;
