const express = require('express');
const router = express.Router({ mergeParams: true });
const decisionController = require('../controllers/decisionController');

router.get('/', decisionController.getDecisions);
router.post('/', decisionController.executeDecision);

module.exports = router;
