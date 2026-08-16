const eventService = require('../services/eventService');
const { exec } = require('child_process');

async function getEvent(req, res) {
    const { id } = req.params;
    try {
        const data = await eventService.getEventWithDetails(id);
        if (!data) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(data);
    } catch (error) {
        console.error("Error in getEvent:", error);
        res.status(500).json({ error: error.message });
    }
}

async function updateBudget(req, res) {
    const { id } = req.params;
    try {
        const updatedEvent = await eventService.updateEventBudget(id, req.body);
        if (!updatedEvent) {
            return res.status(400).json({ error: 'No valid budget fields provided to update or event not found' });
        }
        res.json({ message: 'Budget updated successfully', event: updatedEvent });
    } catch (error) {
        console.error("Error in updateBudget:", error);
        res.status(400).json({ error: error.message });
    }
}

async function updateVendor(req, res) {
    const { eventId, vendorId } = req.params;
    try {
        const updatedVendor = await eventService.updateVendor(eventId, vendorId, req.body);
        if (!updatedVendor) {
            return res.status(400).json({ error: 'No valid fields provided or vendor not found' });
        }
        res.json({ message: 'Vendor updated successfully', vendor: updatedVendor });
    } catch (error) {
        console.error("Error in updateVendor:", error);
        res.status(400).json({ error: error.message });
    }
}

async function incrementHeadcount(req, res) {
    const { id } = req.params;
    const { delta } = req.body;
    try {
        const updatedEvent = await eventService.incrementHeadcount(id, delta);
        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Headcount updated', event: updatedEvent });
    } catch (error) {
        console.error("Error in incrementHeadcount:", error);
        res.status(400).json({ error: error.message });
    }
}

async function resetDemo(req, res) {
    try {
        exec('python seed.py', { cwd: '../db' }, (error, stdout, stderr) => {
            if (error) {
                console.error("Reset script failed:", error);
                return res.status(500).json({ error: error.message });
            }
            res.json({ message: 'Demo reset successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getEvent,
    updateBudget,
    updateVendor,
    incrementHeadcount,
    resetDemo
};
