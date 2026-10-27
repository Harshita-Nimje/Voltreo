const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
require("dotenv").config();

const pool = require("./db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chargerRoutes = require("./routes/chargerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const authenticateToken = require("./middleware/authenticateToken");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE"],
    },
});

// Authenticate Socket.IO connections using JWT
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(
            new Error("Authentication token is required.")
        );
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded.id) {
            return next(
                new Error("Invalid authentication token.")
            );
        }

        socket.user = decoded;
        next();
    } catch (error) {
        return next(
            new Error("Invalid or expired authentication token.")
        );
    }
});

// Connect authenticated users to their private rooms
io.on("connection", (socket) => {
    const userRoom = `user_${socket.user.id}`;

    socket.join(userRoom);

    console.log(
        `Voltreo user ${socket.user.id} connected:`,
        socket.id
    );

    socket.on("disconnect", () => {
        console.log(
            `Voltreo user ${socket.user.id} disconnected:`,
            socket.id
        );
    });
});

// Make Socket.IO available to controllers
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chargers", chargerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

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
            tables: result.rows.map(
                (row) => row.table_name
            ),
        });
    } catch (error) {
        console.error(
            "Database error:",
            error.message
        );

        res.status(500).json({
            message: "Database connection failed",
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `Voltreo backend running on port ${PORT}`
    );
});