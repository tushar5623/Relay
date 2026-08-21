const express = require('express');
const router = express.Router({ mergeParams: true });
const disruptionController = require('../controllers/disruptionController');
const { requireAuth, requireEventAccess } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireEventAccess);

router.get('/', disruptionController.getDisruptions);
router.post('/', disruptionController.createDisruption);

module.exports = router;
