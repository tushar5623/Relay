const vendorService = require('../services/vendorService');

async function getVendor(req, res) {
    const { eventId, vendorId } = req.params;
    try {
        const vendor = await vendorService.getVendor(eventId, vendorId);
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
        res.json(vendor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getAvailability(req, res) {
    const { eventId, vendorId } = req.params;
    try {
        const availability = await vendorService.getVendorAvailability(eventId, vendorId);
        if (!availability) return res.status(404).json({ error: 'Vendor not found' });
        res.json(availability);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateStatus(req, res) {
    const { eventId, vendorId } = req.params;
    const { status } = req.body;
    try {
        const updated = await vendorService.updateVendorStatus(eventId, vendorId, status);
        if (!updated) return res.status(404).json({ error: 'Vendor not found' });
        res.json({ message: 'Status updated', vendor: updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function updateQuote(req, res) {
    const { eventId, vendorId } = req.params;
    const { quote } = req.body;
    try {
        const updated = await vendorService.updateVendorQuote(eventId, vendorId, quote);
        if (!updated) return res.status(404).json({ error: 'Vendor not found' });
        res.json({ message: 'Quote updated', vendor: updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function cancelVendor(req, res) {
    const { eventId, vendorId } = req.params;
    try {
        const result = await vendorService.simulateVendorCancellation(eventId, vendorId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = {
    getVendor,
    getAvailability,
    updateStatus,
    updateQuote,
    cancelVendor
};
