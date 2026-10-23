-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Chargers
CREATE TABLE IF NOT EXISTS chargers (
    id SERIAL PRIMARY KEY,
    host_id INTEGER NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    charger_type VARCHAR(50) NOT NULL,
    power_kw DECIMAL(6, 2) NOT NULL CHECK (power_kw > 0),
    price_per_hour DECIMAL(10, 2) NOT NULL
        CHECK (price_per_hour >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN ('pending', 'approved', 'rejected', 'inactive')
        ),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,

    charger_id INTEGER NOT NULL
        REFERENCES chargers(id) ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    total_price DECIMAL(10, 2) NOT NULL
        CHECK (total_price >= 0),

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'cancelled',
                'completed'
            )
        ),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CHECK (end_time > start_time)
);

-- 4. Prevent overlapping active bookings
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'no_overlapping_bookings'
          AND conrelid = 'bookings'::regclass
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT no_overlapping_bookings
        EXCLUDE USING gist (
            charger_id WITH =,
            tstzrange(start_time, end_time, '[)') WITH &&
        )
        WHERE (status IN ('pending', 'approved'));
    END IF;
END
$$;

-- 5. Booking activity history
CREATE TABLE IF NOT EXISTS booking_events (
    id SERIAL PRIMARY KEY,

    booking_id INTEGER NOT NULL
        REFERENCES bookings(id) ON DELETE CASCADE,

    actor_id INTEGER
        REFERENCES users(id) ON DELETE SET NULL,

    event_type VARCHAR(50) NOT NULL,

    details TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Weekly charger availability
CREATE TABLE IF NOT EXISTS charger_availability (
    id SERIAL PRIMARY KEY,

    charger_id INTEGER NOT NULL
        REFERENCES chargers(id) ON DELETE CASCADE,

    day_of_week SMALLINT NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CHECK (end_time > start_time),

    UNIQUE (charger_id, day_of_week, start_time, end_time)
);

-- 7. Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,

    booking_id INTEGER NOT NULL UNIQUE
        REFERENCES bookings(id) ON DELETE CASCADE,

    reviewer_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    charger_id INTEGER NOT NULL
        REFERENCES chargers(id) ON DELETE CASCADE,

    rating SMALLINT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. User notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    booking_id INTEGER
        REFERENCES bookings(id) ON DELETE CASCADE,

    title VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Saved chargers
CREATE TABLE IF NOT EXISTS saved_chargers (
    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    charger_id INTEGER NOT NULL
        REFERENCES chargers(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, charger_id)
);

-- 10. Performance indexes

-- Find chargers belonging to a host
CREATE INDEX IF NOT EXISTS idx_chargers_host_id
ON chargers(host_id);

-- Find approved chargers for discovery
CREATE INDEX IF NOT EXISTS idx_chargers_status
ON chargers(status);

-- Find bookings for a specific charger and time
CREATE INDEX IF NOT EXISTS idx_bookings_charger_time
ON bookings(charger_id, start_time, end_time);

-- Find bookings made by a user
CREATE INDEX IF NOT EXISTS idx_bookings_user_id
ON bookings(user_id);

-- Load booking activity history
CREATE INDEX IF NOT EXISTS idx_booking_events_booking_id
ON booking_events(booking_id);

-- Load availability for a charger
CREATE INDEX IF NOT EXISTS idx_charger_availability_charger_id
ON charger_availability(charger_id);

-- Load notifications for a user
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
ON notifications(user_id, created_at DESC);

-- Load reviews for a charger
CREATE INDEX IF NOT EXISTS idx_reviews_charger_id
ON reviews(charger_id);