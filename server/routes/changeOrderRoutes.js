const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const changeOrderController = require('../controllers/changeOrderController');

const router = express.Router();

router.post(
  '/requests/:id/change-order',
  authMiddleware,
  asyncHandler(changeOrderController.createChangeOrder)
);

router.get(
  '/projects/:id/change-orders',
  authMiddleware,
  asyncHandler(changeOrderController.listChangeOrders)
);

router.get(
  '/change-orders/:id',
  authMiddleware,
  asyncHandler(changeOrderController.getChangeOrder)
);

router.put(
  '/change-orders/:id',
  authMiddleware,
  asyncHandler(changeOrderController.updateDraftChangeOrder)
);

router.put(
  '/change-orders/:id/send',
  authMiddleware,
  asyncHandler(changeOrderController.sendChangeOrder)
);

router.put(
  '/portal/:token/change-orders/:id/approve',
  asyncHandler(changeOrderController.approveChangeOrder)
);

router.put(
  '/portal/:token/change-orders/:id/decline',
  asyncHandler(changeOrderController.declineChangeOrder)
);

module.exports = router;
