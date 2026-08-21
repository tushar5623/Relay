const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const globalVendorController = require('../controllers/globalVendorController');

// All routes require auth
router.use(requireAuth);

// Planners, Approvers, and Admins can view
router.get('/', globalVendorController.getGlobalVendors);
router.get('/:id', globalVendorController.getGlobalVendor);

// Only Admins can modify the central database directly
router.post('/', requireRole(['admin']), globalVendorController.createGlobalVendor);
router.patch('/:id', requireRole(['admin']), globalVendorController.updateGlobalVendor);

// Approvers and Admins can associate global vendors to events
router.post('/:id/associate', requireRole(['approver', 'admin']), globalVendorController.associateWithEvent);

module.exports = router;
