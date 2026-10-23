const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");
const authorizeAdmin = require("../middleware/authorizeAdmin");

const {
    getProfile,
    getAllUsers,
} = require("../controllers/userController");

// Any authenticated user can view their own profile
router.get("/profile", authenticateToken, getProfile);

// Only Admin can view all platform users
router.get(
    "/admin",
    authenticateToken,
    authorizeAdmin,
    getAllUsers
);

module.exports = router;