const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth, requireEventAccess, requireRole } = require('../middleware/auth');

router.get('/:id/client-status', eventController.getClientStatus);

router.use(requireAuth);

router.get('/', eventController.getEvents);
router.get('/:id', requireEventAccess, eventController.getEvent);
router.patch('/:id/budget', requireEventAccess, requireRole(['admin']), eventController.updateBudget);
router.post('/:id/headcount', requireEventAccess, requireRole(['approver', 'admin']), eventController.incrementHeadcount);
router.post('/:id/reset', requireRole(['admin']), eventController.resetDemo);
router.post('/:id/import', requireEventAccess, requireRole(['admin']), eventController.importData);

module.exports = router;
