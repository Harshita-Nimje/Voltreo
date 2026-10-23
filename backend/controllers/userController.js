const pool = require("../db");

// Get the logged-in user's profile
const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        return res.status(200).json({
            user: result.rows[0],
        });
    } catch (error) {
        console.error("Profile error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while fetching your profile.",
        });
    }
};

// Admin: Get all platform users
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            users: result.rows,
        });
    } catch (error) {
        console.error("Fetch all users error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while fetching users.",
        });
    }
};

module.exports = {
    getProfile,
    getAllUsers,
};