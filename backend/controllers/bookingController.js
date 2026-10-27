const pool = require("../db");
const createNotification = require("../utils/notificationHelper");

const createBooking = async (req, res) => {
    try {
        const { charger_id, start_time, end_time } = req.body;

        // Validate required fields
        if (!charger_id || !start_time || !end_time) {
            return res.status(400).json({
                message: "Charger, start time, and end time are required.",
            });
        }

        // Validate booking dates
        const start = new Date(start_time);
        const end = new Date(end_time);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            return res.status(400).json({
                message: "Please provide valid booking times.",
            });
        }

        // Booking must be in the future
        if (start <= new Date()) {
            return res.status(400).json({
                message: "Booking must start in the future.",
            });
        }

        // Check whether the charger exists and is approved
        const chargerResult = await pool.query(
            `SELECT id, host_id, price_per_hour
             FROM chargers
             WHERE id = $1 AND status = 'approved'`,
            [charger_id]
        );

        if (chargerResult.rows.length === 0) {
            return res.status(404).json({
                message: "Approved charger not found.",
            });
        }

        const charger = chargerResult.rows[0];

        // Validate charger availability using Indian Standard Time
        const availabilityResult = await pool.query(
            `SELECT day_of_week, start_time, end_time
             FROM charger_availability
             WHERE charger_id = $1
               AND is_available = TRUE`,
            [charger_id]
        );

        const availability = availabilityResult.rows;

        const getIndiaDateParts = (date) => {
            const parts = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: "h23",
            }).formatToParts(date);

            const values = Object.fromEntries(
                parts.map(({ type, value }) => [type, value])
            );

            const dayMap = {
                Sun: 0,
                Mon: 1,
                Tue: 2,
                Wed: 3,
                Thu: 4,
                Fri: 5,
                Sat: 6,
            };

            return {
                day: dayMap[values.weekday],
                time: `${values.hour}:${values.minute}:${values.second}`,
            };
        };

        const startParts = getIndiaDateParts(start);
        const endParts = getIndiaDateParts(end);

        // Keep bookings within a single calendar day for now
        // Keep bookings within a single Indian calendar day
        const getIndiaCalendarDate = (date) =>
            new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(date);

        if (getIndiaCalendarDate(start) !== getIndiaCalendarDate(end)) {
            return res.status(400).json({
                message: "Bookings must start and end on the same day.",
            });
        }

        const matchingAvailability = availability.find((slot) => {
            const slotStart = String(slot.start_time).slice(0, 8);
            const slotEnd = String(slot.end_time).slice(0, 8);

            return (
                Number(slot.day_of_week) === startParts.day &&
                startParts.time >= slotStart &&
                endParts.time <= slotEnd
            );
        });

        if (!matchingAvailability) {
            return res.status(400).json({
                message:
                    "The requested time is outside this charger's available hours.",
            });
        }


        // Prevent hosts from booking their own chargers
        if (Number(charger.host_id) === Number(req.user.id)) {
            return res.status(400).json({
                message: "You cannot book your own charger.",
            });
        }

        // Calculate booking duration and total price
        const durationHours =
            (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        const totalPrice = (
            durationHours * Number(charger.price_per_hour)
        ).toFixed(2);

        // Create the booking
        const result = await pool.query(
            `INSERT INTO bookings
                (charger_id, user_id, start_time, end_time, total_price, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING *`,
            [
                charger_id,
                req.user.id,
                start.toISOString(),
                end.toISOString(),
                totalPrice,
            ]
        );

        const booking = result.rows[0];

        // Record the booking creation event
        await pool.query(
            `INSERT INTO booking_events
                (booking_id, actor_id, event_type, details)
             VALUES ($1, $2, $3, $4)`,
            [
                booking.id,
                req.user.id,
                "booking_created",
                "Booking request created with pending status.",
            ]
        );

        // Save and send a notification to the charger host
        const io = req.app.get("io");

        await createNotification({
            pool,
            io,
            userId: charger.host_id,
            bookingId: booking.id,
            title: "New booking request",
            message: "You have received a new booking request.",
            eventType: "booking_created",
            booking: {
                ...booking,
                host_id: charger.host_id,
            },
            actorId: req.user.id,
        });

        if (io) {
            io.to(`user_${charger.host_id}`).emit("booking_updated", {
                booking: {
                    ...booking,
                    host_id: charger.host_id,
                },
                event_type: "booking_created",
                actor_id: req.user.id,
                message: "You have received a new booking request.",
            });
        }

        // Send the response
        return res.status(201).json({
            message: "Booking request created successfully.",
            booking,
        });
    } catch (error) {
        // Handle overlapping booking conflicts
        if (error.code === "23P01") {
            return res.status(409).json({
                message:
                    "This charger already has a booking during that time.",
            });
        }

        console.error("Create booking error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while creating the booking.",
        });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                b.id,
                b.charger_id,
                b.user_id,
                c.host_id,
                b.start_time,
                b.end_time,
                b.total_price,
                b.status,
                b.created_at,
                c.title AS charger_title,
                c.address AS charger_address,
                u.name AS host_name,
                latest_event.event_type AS latest_event_type,
                latest_event.actor_id AS latest_event_actor_id,
                latest_event.details AS latest_event_details
            FROM bookings b
            JOIN chargers c ON c.id = b.charger_id
            JOIN users u ON u.id = c.host_id
            LEFT JOIN LATERAL (
                SELECT
                    be.event_type,
                    be.actor_id,
                    be.details
                FROM booking_events be
                WHERE be.booking_id = b.id
                ORDER BY be.created_at DESC
                LIMIT 1
            ) latest_event ON TRUE
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            bookings: result.rows,
        });
    } catch (error) {
        console.error("Fetch bookings error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while fetching your bookings.",
        });
    }
};

const getHostBookings = async (req, res) => {
    try {
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
         u.name AS driver_name,
         u.email AS driver_email
       FROM bookings b
       JOIN chargers c ON c.id = b.charger_id
       JOIN users u ON u.id = b.user_id
       WHERE c.host_id = $1
       ORDER BY b.created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            bookings: result.rows,
        });
    } catch (error) {
        console.error("Fetch host bookings error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while fetching host bookings.",
        });
    }
};

const updateBookingStatus = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate the requested status
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected.",
            });
        }

        await client.query("BEGIN");

        // Update only a pending booking owned by this host
        const result = await client.query(
            `UPDATE bookings b
     SET status = $1
     FROM chargers c
     WHERE b.id = $2
       AND b.charger_id = c.id
       AND c.host_id = $3
       AND b.status = 'pending'
     RETURNING b.*, c.host_id`,
            [status, id, req.user.id]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message:
                    "Pending booking not found, or you are not its charger host.",
            });
        }

        const booking = result.rows[0];

        // Record the status-change event in the same transaction
        await client.query(
            `INSERT INTO booking_events
                (booking_id, actor_id, event_type, details)
             VALUES ($1, $2, $3, $4)`,
            [
                booking.id,
                req.user.id,
                `booking_${status}`,
                `Host ${status} the booking request.`,
            ]
        );

        await client.query("COMMIT");

        const io = req.app.get("io");

        const notificationTitle =
            status === "approved"
                ? "Booking approved"
                : "Booking rejected";

        const notificationMessage =
            status === "approved"
                ? "Your booking request has been approved by the host."
                : "Your booking request has been rejected by the host.";

        // Save a notification for the driver
        await createNotification({
            pool,
            io,
            userId: booking.user_id,
            bookingId: booking.id,
            title: notificationTitle,
            message: notificationMessage,
            eventType: `booking_${status}`,
            booking,
            actorId: req.user.id,
        });

        // Keep the host's booking list updated in real time
        if (io) {
            io.to(`user_${booking.host_id}`).emit("booking_updated", {
                booking,
                event_type: `booking_${status}`,
                actor_id: req.user.id,
                message: `You ${status} the booking request.`,
            });
        }

        if (io) {
            const notificationUpdate = {
                booking,
                event_type: `booking_${status}`,
                actor_id: req.user.id,
                message:
                    status === "approved"
                        ? "Your booking has been approved by the host."
                        : "Your booking request has been rejected by the host.",
            };

            // Notify the driver
            io.to(`user_${booking.user_id}`).emit(
                "booking_updated",
                notificationUpdate
            );

            // Notify the host
            io.to(`user_${booking.host_id}`).emit(
                "booking_updated",
                notificationUpdate
            );
        }

        return res.status(200).json({
            message: `Booking ${status} successfully.`,
            booking,
        });
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("Booking rollback error:", rollbackError.message);
        }

        // Handle overlapping active-booking conflicts
        if (error.code === "23P01") {
            return res.status(409).json({
                message:
                    "This booking conflicts with another active booking.",
            });
        }

        console.error("Update booking status error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while updating the booking.",
        });
    } finally {
        client.release();
    }
};


const cancelBooking = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE bookings b
             SET status = 'cancelled'
             FROM chargers c
             WHERE b.id = $1
               AND b.user_id = $2
               AND b.charger_id = c.id
               AND b.status IN ('pending', 'approved')
               AND b.end_time > NOW()
             RETURNING b.*, c.host_id`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message:
                    "Booking not found, already ended, or cannot be cancelled.",
            });
        }

        const booking = result.rows[0];

        // Record the cancellation event
        await client.query(
            `INSERT INTO booking_events
                (booking_id, actor_id, event_type, details)
             VALUES ($1, $2, $3, $4)`,
            [
                booking.id,
                req.user.id,
                "booking_cancelled",
                "Driver cancelled the booking.",
            ]
        );

        await client.query("COMMIT");

        const io = req.app.get("io");

        // Save a notification for the charger host
        await createNotification({
            pool,
            io,
            userId: booking.host_id,
            bookingId: booking.id,
            title: "Booking cancelled",
            message: "The driver has cancelled their booking.",
            eventType: "booking_cancelled",
            booking,
            actorId: req.user.id,
        });

        // Update the driver's booking list in real time
        if (io) {
            io.to(`user_${booking.user_id}`).emit("booking_updated", {
                booking,
                event_type: "booking_cancelled",
                actor_id: req.user.id,
                message: "You cancelled this booking.",
            });
        }

        return res.status(200).json({
            message: "Booking cancelled successfully.",
            booking,
        });
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Booking rollback error:",
                rollbackError.message
            );
        }

        console.error("Cancel booking error:", error.message);

        return res.status(500).json({
            message: "Failed to cancel booking.",
        });
    } finally {
        client.release();
    }
};

const getBookedSlots = async (req, res) => {
    try {
        const { charger_id } = req.params;

        if (!charger_id || !Number.isInteger(Number(charger_id))) {
            return res.status(400).json({
                message: "A valid charger ID is required.",
            });
        }

        const result = await pool.query(
            `SELECT start_time, end_time
             FROM bookings
             WHERE charger_id = $1
               AND status IN ('pending', 'approved')
             ORDER BY start_time ASC`,
            [charger_id]
        );

        return res.status(200).json({
            bookedSlots: result.rows,
        });
    } catch (error) {
        console.error("Fetch booked slots error:", error.message);

        return res.status(500).json({
            message: "Unable to fetch booked time slots.",
        });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getHostBookings,
    updateBookingStatus,
    cancelBooking,
    getBookedSlots,
};