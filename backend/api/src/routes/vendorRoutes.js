const express = require('express');
const router = express.Router({ mergeParams: true });
const vendorController = require('../controllers/vendorController');

router.get('/:vendorId', vendorController.getVendor);
router.get('/:vendorId/availability', vendorController.getAvailability);
router.patch('/:vendorId/status', vendorController.updateStatus);
router.patch('/:vendorId/quote', vendorController.updateQuote);
router.post('/:vendorId/cancel', vendorController.cancelVendor);

module.exports = router;
