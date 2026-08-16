const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/:id', eventController.getEvent);
router.patch('/:id/budget', eventController.updateBudget);
router.post('/:id/headcount', eventController.incrementHeadcount);
router.post('/:id/reset', eventController.resetDemo);

module.exports = router;
