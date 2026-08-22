const { getDb } = require('../db/connection');
const { v4: uuidv4 } = require('uuid');
const notificationService = require('./notificationService');

async function getDisruptions(eventId) {
    const db = getDb();
    return await db.collection('disruptions').find({ event_id: eventId }).sort({ created_at: -1 }).toArray();
}

async function createDisruption(eventId, data) {
    const db = getDb();
    
    if (!data.type || !data.severity || !data.description) {
        throw new Error("Missing required fields: type, severity, description");
    }

    const validTypes = ['vendor_cancellation', 'budget_change', 'headcount_change', 'timeline_conflict', 'other'];
    if (!validTypes.includes(data.type)) {
        throw new Error(`Invalid disruption type. Must be one of: ${validTypes.join(', ')}`);
    }

    const disruption = {
        disruption_id: `dis_${uuidv4().replace(/-/g, '').substring(0, 12)}`,
        event_id: eventId,
        type: data.type,
        severity: data.severity,
        description: data.description,
        vendor_id: data.vendor_id || null,
        amount: data.amount || null,
        guest_count: data.guest_count || null,
        timeline_block: data.timeline_block || null,
        reported_by: data.reported_by || "event_operator",
        created_at: new Date().toISOString(),
        status: "open"
    };

    await db.collection('disruptions').insertOne(disruption);
    
    // Feature 10: Create Notification for Action A
    const event = await db.collection('events').findOne({ _id: eventId });
    if (event) {
        await notificationService.createNotification(
            event.account_id,
            eventId,
            'disruption_reported',
            'New Disruption',
            `A ${data.type.replace('_', ' ')} has been reported for ${event.name}.`,
            data.severity || 'high',
            ['admin', 'approver']
        );
    }
    
    // Do not return _id in the response if possible, or just return the constructed object
    const { _id, ...safeDisruption } = disruption;
    return safeDisruption;
}

module.exports = {
    getDisruptions,
    createDisruption
};
