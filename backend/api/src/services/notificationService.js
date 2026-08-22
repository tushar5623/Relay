const { getDb } = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

async function createNotification(accountId, eventId, type, title, message, severity, targetRoles) {
    const db = getDb();
    
    const notification = {
        _id: `notif_${uuidv4().replace(/-/g, '').substring(0, 12)}`,
        account_id: accountId,
        event_id: eventId,
        type: type,
        title: title,
        message: message,
        severity: severity,
        target_roles: targetRoles,
        created_at: new Date().toISOString(),
        read_by: []
    };

    await db.collection('notifications').insertOne(notification);
    return notification;
}

async function getNotificationsForUser(user) {
    const db = getDb();
    
    // 1. Fetch user's assigned events
    const events = await db.collection('events').find({ account_id: user.account_id }).toArray();
    
    let assignedEventIds = [];
    if (user.role === 'admin') {
        assignedEventIds = events.map(e => e._id);
    } else {
        assignedEventIds = events.filter(e => e.team && e.team.includes(user._id)).map(e => e._id);
    }

    // 2. Threshold Alert (Action D): Check for unresolved disruptions older than 2 minutes in assigned events
    if (assignedEventIds.length > 0 && ['admin', 'approver'].includes(user.role)) {
        const thresholdTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        const unresolvedDisruptions = await db.collection('disruptions').find({
            event_id: { $in: assignedEventIds },
            status: 'open',
            created_at: { $lt: thresholdTime }
        }).toArray();

        for (const disruption of unresolvedDisruptions) {
            // Check if alert already exists for this disruption to prevent duplicates
            const existingAlert = await db.collection('notifications').findOne({
                account_id: user.account_id,
                event_id: disruption.event_id,
                type: 'disruption_threshold',
                message: { $regex: disruption.disruption_id }
            });

            if (!existingAlert) {
                const event = events.find(e => e._id === disruption.event_id);
                await createNotification(
                    user.account_id,
                    disruption.event_id,
                    'disruption_threshold',
                    'Unresolved Disruption Alert',
                    `A disruption (${disruption.disruption_id}) for ${event ? event.name : disruption.event_id} has been unresolved for over 2 minutes.`,
                    'critical',
                    ['admin', 'approver']
                );
            }
        }
    }

    // 3. Fetch notifications matching user's account, roles, and assigned events
    const query = {
        account_id: user.account_id,
        target_roles: user.role
    };

    if (user.role !== 'admin') {
        query.event_id = { $in: assignedEventIds };
    }

    const notifications = await db.collection('notifications')
        .find(query)
        .sort({ created_at: -1 })
        .toArray();

    // 4. Map to include `read` boolean for the specific user
    return notifications.map(n => {
        const isRead = n.read_by && n.read_by.includes(user._id);
        const { read_by, ...safeNotification } = n;
        return {
            ...safeNotification,
            read: isRead
        };
    });
}

async function markAsRead(notificationId, userId) {
    const db = getDb();
    await db.collection('notifications').updateOne(
        { _id: notificationId },
        { $addToSet: { read_by: userId } }
    );
    return { success: true };
}

async function markAllAsRead(user) {
    const db = getDb();
    
    // Determine which notifications are visible to this user
    let assignedEventIds = [];
    if (user.role !== 'admin') {
        const events = await db.collection('events').find({ account_id: user.account_id }).toArray();
        assignedEventIds = events.filter(e => e.team && e.team.includes(user._id)).map(e => e._id);
    }
    
    const query = {
        account_id: user.account_id,
        target_roles: user.role
    };

    if (user.role !== 'admin') {
        query.event_id = { $in: assignedEventIds };
    }

    await db.collection('notifications').updateMany(
        query,
        { $addToSet: { read_by: user._id } }
    );
    
    return { success: true };
}

module.exports = {
    createNotification,
    getNotificationsForUser,
    markAsRead,
    markAllAsRead
};
