const createNotification = async ({
    pool,
    io,
    userId,
    bookingId,
    title,
    message,
    eventType,
    booking,
    actorId,
}) => {
    const result = await pool.query(
        `INSERT INTO notifications
            (user_id, booking_id, title, message)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, bookingId ?? null, title, message]
    );

    const notification = {
        ...result.rows[0],
        event_type: eventType,
        booking_id: bookingId ?? null,
        booking_details: booking
            ? {
                id: booking.id,
                charger_id: booking.charger_id,
                charger_title: booking.charger_title || null,
                start_time: booking.start_time,
                end_time: booking.end_time,
                status: booking.status,
            }
            : null,
    };

    if (io) {
        io.to(`user_${userId}`).emit(
            "notification_new",
            notification
        );

        if (booking) {
            io.to(`user_${userId}`).emit("booking_updated", {
                booking,
                event_type: eventType,
                actor_id: actorId,
                message,
            });
        }
    }

    return notification;
};

module.exports = createNotification;