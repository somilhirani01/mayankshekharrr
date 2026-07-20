const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const scopeController = require('../controllers/scopeController');

const router = express.Router();

router.put(
  '/scope-items/:id',
  authMiddleware,
  asyncHandler(scopeController.updateScopeItem)
);
router.delete(
  '/scope-items/:id',
  authMiddleware,
  asyncHandler(scopeController.deleteScopeItem)
);

module.exports = router;
