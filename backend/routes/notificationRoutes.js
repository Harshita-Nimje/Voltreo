const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");

const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
} = require("../controllers/notificationController");

// Get notifications and unread count
router.get("/", authenticateToken, getNotifications);

// Mark all notifications as read
router.patch("/read-all", authenticateToken, markAllNotificationsRead);

// Mark one notification as read
router.patch("/:id/read", authenticateToken, markNotificationRead);

// Clear all notifications for the logged-in user
router.delete("/clear", authenticateToken, clearAllNotifications);

module.exports = router;