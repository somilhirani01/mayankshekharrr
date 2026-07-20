const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const portalRateLimit = require('../middleware/portalRateLimit');
const requestController = require('../controllers/requestController');

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
  '/projects/:id/requests',
  authMiddleware,
  asyncHandler(requestController.listProjectRequests)
);

module.exports = router;
