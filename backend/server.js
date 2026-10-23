const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const authenticateToken = require("./middleware/authenticateToken");
const chargerRoutes = require("./routes/chargerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chargers", chargerRoutes);
app.use("/api/bookings", bookingRoutes);

// Protected test endpoint
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({
        message: "You accessed a protected route successfully!",
        user: req.user,
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.send("Voltreo backend is running!");
});

// Database connection test
app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        res.json({
            message: "Voltreo database connected successfully!",
            tables: result.rows.map((row) => row.table_name),
        });
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            message: "Database connection failed",
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Voltreo backend running on port ${PORT}`);
});