const disruptionService = require('../services/disruptionService');

async function getDisruptions(req, res) {
    const { eventId } = req.params;
    try {
        const disruptions = await disruptionService.getDisruptions(eventId);
        res.json(disruptions);
    } catch (error) {
        console.error("Error in getDisruptions:", error);
        res.status(500).json({ error: error.message });
    }
}

async function createDisruption(req, res) {
    const { eventId } = req.params;
    try {
        const disruption = await disruptionService.createDisruption(eventId, req.body);
        res.status(201).json(disruption);
    } catch (error) {
        console.error("Error in createDisruption:", error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    getDisruptions,
    createDisruption
};
