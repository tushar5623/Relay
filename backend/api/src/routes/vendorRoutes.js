const express = require('express');
const router = express.Router({ mergeParams: true });
const vendorController = require('../controllers/vendorController');
const { requireAuth, requireEventAccess, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireEventAccess);

router.get('/:vendorId', vendorController.getVendor);
router.get('/:vendorId/availability', vendorController.getAvailability);
router.patch('/:vendorId/status', requireRole(['approver', 'admin']), vendorController.updateStatus);
router.patch('/:vendorId/quote', requireRole(['approver', 'admin']), vendorController.updateQuote);
router.post('/:vendorId/cancel', vendorController.cancelVendor);

module.exports = router;
