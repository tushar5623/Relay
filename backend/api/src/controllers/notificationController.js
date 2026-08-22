const notificationService = require('../services/notificationService');

async function getNotifications(req, res) {
    try {
        const notifications = await notificationService.getNotificationsForUser(req.user);
        res.json(notifications);
    } catch (error) {
        console.error("Error in getNotifications:", error);
        res.status(500).json({ error: error.message });
    }
}

async function markAsRead(req, res) {
    const { id } = req.params;
    try {
        await notificationService.markAsRead(id, req.user._id);
        res.json({ success: true });
    } catch (error) {
        console.error("Error in markAsRead:", error);
        res.status(500).json({ error: error.message });
    }
}

async function markAllAsRead(req, res) {
    try {
        await notificationService.markAllAsRead(req.user);
        res.json({ success: true });
    } catch (error) {
        console.error("Error in markAllAsRead:", error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
