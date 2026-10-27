const pool = require("../db");

// Get the logged-in user's notifications
const getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, user_id, booking_id, title, message,
                    is_read, created_at
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 50`,
            [req.user.id]
        );

        const unreadResult = await pool.query(
            `SELECT COUNT(*) AS unread_count
             FROM notifications
             WHERE user_id = $1 AND is_read = FALSE`,
            [req.user.id]
        );

        return res.status(200).json({
            notifications: result.rows,
            unread_count: Number(unreadResult.rows[0].unread_count),
        });
    } catch (error) {
        console.error("Fetch notifications error:", error.message);

        return res.status(500).json({
            message: "Unable to fetch notifications.",
        });
    }
};

// Mark one notification as read
const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE id = $1 AND user_id = $2
             RETURNING id, is_read`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Notification not found.",
            });
        }

        return res.status(200).json({
            message: "Notification marked as read.",
            notification: result.rows[0],
        });
    } catch (error) {
        console.error("Mark notification read error:", error.message);

        return res.status(500).json({
            message: "Unable to update notification.",
        });
    }
};

// Mark all notifications as read
const markAllNotificationsRead = async (req, res) => {
    try {
        await pool.query(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE user_id = $1 AND is_read = FALSE`,
            [req.user.id]
        );

        return res.status(200).json({
            message: "All notifications marked as read.",
        });
    } catch (error) {
        console.error("Mark all notifications read error:", error.message);

        return res.status(500).json({
            message: "Unable to update notifications.",
        });
    }
};

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
};