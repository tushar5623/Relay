const { getDb } = require('../db/connection');

async function logActivity({ userId, action, eventId, entity, metadata }) {
    try {
        const db = getDb();
        const logEntry = {
            user_id: userId,
            action: action,
            event_id: eventId,
            entity: entity,
            metadata: metadata || {},
            timestamp: new Date().toISOString()
        };
        await db.collection('activity_logs').insertOne(logEntry);
    } catch (err) {
        console.error("Failed to log activity:", err);
    }
}

module.exports = { logActivity };
