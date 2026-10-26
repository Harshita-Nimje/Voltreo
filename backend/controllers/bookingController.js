const pool = require("../db");

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
        if (startParts.day !== endParts.day) {
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
         b.start_time,
         b.end_time,
         b.total_price,
         b.status,
         b.created_at,
         c.title AS charger_title,
         c.address AS charger_address,
         u.name AS host_name
       FROM bookings b
       JOIN chargers c ON c.id = b.charger_id
       JOIN users u ON u.id = c.host_id
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
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate the requested status
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected.",
            });
        }

        // Update only a pending booking owned by this host
        const result = await pool.query(
            `UPDATE bookings b
             SET status = $1
             FROM chargers c
             WHERE b.id = $2
               AND b.charger_id = c.id
               AND c.host_id = $3
               AND b.status = 'pending'
             RETURNING b.*`,
            [status, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Pending booking not found, or you are not its charger host.",
            });
        }

        const booking = result.rows[0];

        // Record the approval or rejection event
        await pool.query(
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

        return res.status(200).json({
            message: `Booking ${status} successfully.`,
            booking,
        });
    } catch (error) {
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
    }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE bookings
       SET status = 'cancelled'
       WHERE id = $1
         AND user_id = $2
         AND status IN ('pending', 'approved')
       RETURNING *`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Booking not found, or it cannot be cancelled.",
            });
        }

        return res.status(200).json({
            message: "Booking cancelled successfully.",
            booking: result.rows[0],
        });
    } catch (error) {
        console.error("Cancel booking error:", error.message);

        return res.status(500).json({
            message: "Failed to cancel booking.",
        });
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