const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const projectController = require('../controllers/projectController');
const scopeController = require('../controllers/scopeController');
const timelineController = require('../controllers/timelineController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(projectController.listProjects));
router.post('/', asyncHandler(projectController.createProject));
router.get('/:id', asyncHandler(projectController.getProject));
router.put('/:id', asyncHandler(projectController.updateProject));
router.delete('/:id', asyncHandler(projectController.deleteProject));

router.get('/:id/scope-items', asyncHandler(scopeController.listScopeItems));
router.post('/:id/scope-items', asyncHandler(scopeController.createScopeItem));
router.get('/:id/timeline', asyncHandler(timelineController.getProjectTimeline));

module.exports = router;
