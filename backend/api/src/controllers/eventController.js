const eventService = require('../services/eventService');
const { exec } = require('child_process');
const csv = require('csv-parse/sync');
const { getDb } = require('../db/connection');

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

async function getEvents(req, res) {
    try {
        const db = getDb();
        const accountId = req.user.account_id;
        const events = await db.collection('events').find({ account_id: accountId }).project({ _id: 1, name: 1, date: 1, status: 1 }).toArray();
        res.json(events);
    } catch (error) {
        console.error("Error in getEvents:", error);
        res.status(500).json({ error: 'Internal server error' });
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

async function importData(req, res) {
    const { id } = req.params;
    const { csv_data, domain } = req.body;
    
    if (!csv_data || !domain) {
        return res.status(400).json({ error: 'csv_data and domain are required' });
    }
    
    try {
        const records = csv.parse(csv_data, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        
        const result = await eventService.importEventData(id, domain, records, req.user.account_id);
        res.json({ message: `Successfully imported ${records.length} records for ${domain}`, result });
    } catch (error) {
        console.error("Error in importData:", error);
        res.status(400).json({ error: 'Failed to process CSV data: ' + error.message });
    }
}

module.exports = {
    getEvent,
    getEvents,
    updateBudget,
    updateVendor,
    incrementHeadcount,
    resetDemo,
    importData
};
