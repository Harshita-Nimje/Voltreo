const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const register = async (req, res) => {
    try {
        const { name, email, password, role = "user" } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required.",
            });
        }

        // Only Driver and Host registration are allowed
        if (!["user", "host"].includes(role)) {
            return res.status(400).json({
                message: "Role must be either user or host.",
            });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long.",
            });
        }

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            !name.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                message: "Please provide a valid name and email.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check for an existing account
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "An account with this email already exists.",
            });
        }

        // Hash the password securely
        const passwordHash = await bcrypt.hash(password, 12);

        // Create the account with the selected role
        const result = await pool.query(
            `INSERT INTO users
                (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
            [
                name.trim(),
                normalizedEmail,
                passwordHash,
                role,
            ]
        );

        return res.status(201).json({
            message: `${role === "host" ? "Host" : "Driver"} account created successfully!`,
            user: result.rows[0],
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "An account with this email already exists.",
            });
        }

        return res.status(500).json({
            message: "Something went wrong during registration.",
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            `SELECT id, name, email, password_hash, role
       FROM users
       WHERE email = $1`,
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Something went wrong during login.",
        });
    }
};

module.exports = { register, login };