const { getDb } = require('../db/connection');

async function getVendor(eventId, vendorId) {
    const db = getDb();
    return db.collection('vendors').findOne({ _id: vendorId, event_id: eventId });
}

async function getVendorAvailability(eventId, vendorId) {
    const vendor = await getVendor(eventId, vendorId);
    if (!vendor) return null;
    return { available: vendor.status !== 'cancelled' && vendor.status !== 'rejected' };
}

async function updateVendorStatus(eventId, vendorId, status) {
    const db = getDb();
    const result = await db.collection('vendors').findOneAndUpdate(
        { _id: vendorId, event_id: eventId },
        { $set: { status } },
        { returnDocument: 'after' }
    );
    return result;
}

async function updateVendorQuote(eventId, vendorId, quote) {
    const db = getDb();
    if (typeof quote !== 'number') throw new Error('quote must be a number');
    const result = await db.collection('vendors').findOneAndUpdate(
        { _id: vendorId, event_id: eventId },
        { $set: { quote } },
        { returnDocument: 'after' }
    );
    return result;
}

async function simulateVendorCancellation(eventId, vendorId) {
    const vendor = await getVendor(eventId, vendorId);
    if (!vendor) throw new Error('Vendor not found');
    
    const previousStatus = vendor.status;
    const updatedVendor = await updateVendorStatus(eventId, vendorId, 'cancelled');
    
    return {
        vendor: updatedVendor,
        previous_status: previousStatus,
        new_status: 'cancelled',
        disruption: {
            type: 'vendor_cancellation',
            category: vendor.category
        }
    };
}

module.exports = {
    getVendor,
    getVendorAvailability,
    updateVendorStatus,
    updateVendorQuote,
    simulateVendorCancellation
};
