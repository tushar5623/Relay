const decisionService = require('../services/decisionService');

async function getDecisions(req, res) {
    try {
        const decisions = await decisionService.getDecisions(req.params.eventId);
        res.json(decisions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function executeDecision(req, res) {
    const { eventId } = req.params;
    const { option_id, disruption, option_data } = req.body;
    
    if (!option_id || !disruption) {
        return res.status(400).json({ error: 'option_id and disruption are required' });
    }
    
    try {
        const decision = await decisionService.createAndExecuteDecision(eventId, option_id, disruption, option_data);
        res.json(decision);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getDecisions,
    executeDecision
};
