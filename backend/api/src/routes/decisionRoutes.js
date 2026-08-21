const express = require('express');
const router = express.Router({ mergeParams: true });
const decisionController = require('../controllers/decisionController');
const { requireAuth, requireEventAccess, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireEventAccess);

router.get('/', decisionController.getDecisions);
router.post('/', requireRole(['approver', 'admin']), decisionController.executeDecision);

module.exports = router;
