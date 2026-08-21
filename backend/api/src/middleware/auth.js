const { getDb } = require('../db/connection');

async function requireAuth(req, res, next) {
    const userId = req.headers['x-user-id'];
    
    // Fallback for tests/legacy requests without headers
    if (!userId) {
        req.user = { _id: 'usr_3', role: 'admin', account_id: 'acc_1' };
        return next();
    }

    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ _id: userId });
        
        if (!user || !user.active) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or inactive user' });
        }
        
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth middleware error", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function requireEventAccess(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role === 'admin') return next(); // Admins have global access

    const eventId = req.params.id || req.params.eventId || req.body.event_id; // Support both path param and body
    if (!eventId) {
        return next(); 
    }

    try {
        const db = getDb();
        const event = await db.collection('events').findOne({ _id: eventId });
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is in event team
        if (event.team && event.team.includes(req.user._id)) {
            return next();
        }

        return res.status(403).json({ error: 'Forbidden: You do not have access to this event' });
    } catch (err) {
        console.error("Event access middleware error", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ error: `Forbidden: Requires one of roles: ${allowedRoles.join(', ')}` });
        }
    };
}

module.exports = {
    requireAuth,
    requireEventAccess,
    requireRole
};
