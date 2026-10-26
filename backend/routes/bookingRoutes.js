const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");
const authorizeHost = require("../middleware/authorizeHost");
const authorizeUser = require("../middleware/authorizeUser");
const authorizeAdmin = require("../middleware/authorizeAdmin");

const {
    createBooking,
    getMyBookings,
    getHostBookings,
    updateBookingStatus,
    cancelBooking,
    getBookedSlots,
} = require("../controllers/bookingController");

// Driver-only routes
router.get(
    "/my",
    authenticateToken,
    authorizeUser,
    getMyBookings
);

// Public route: view booked time slots for a charger
router.get("/charger/:charger_id/booked-slots", getBookedSlots);

router.post(
    "/",
    authenticateToken,
    authorizeUser,
    createBooking
);

router.patch(
    "/:id/cancel",
    authenticateToken,
    authorizeUser,
    cancelBooking
);

// Host-only routes
router.get(
    "/host",
    authenticateToken,
    authorizeHost,
    getHostBookings
);

router.patch(
    "/:id/status",
    authenticateToken,
    authorizeHost,
    updateBookingStatus
);

// Admin-only route: view all platform bookings
router.get(
    "/admin",
    authenticateToken,
    authorizeAdmin,
    async (req, res) => {
        try {
            const pool = require("../db");

            const result = await pool.query(
                `SELECT
                    b.id,
                    b.charger_id,
                    b.user_id,
                    b.start_time,
                    b.end_time,
                    b.total_price,
                    b.status,
                    b.created_at,
                    c.title AS charger_title,
                    c.host_id,
                    host.name AS host_name,
                    driver.name AS driver_name,
                    driver.email AS driver_email
                 FROM bookings b
                 JOIN chargers c ON c.id = b.charger_id
                 JOIN users host ON host.id = c.host_id
                 JOIN users driver ON driver.id = b.user_id
                 ORDER BY b.created_at DESC`
            );

            return res.status(200).json({
                bookings: result.rows,
            });
        } catch (error) {
            console.error("Fetch all bookings error:", error.message);

            return res.status(500).json({
                message: "Something went wrong while fetching bookings.",
            });
        }
    }
);

module.exports = router;