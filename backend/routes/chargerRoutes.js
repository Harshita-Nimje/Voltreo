const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const authorizeHost = require("../middleware/authorizeHost");

const {
    createCharger,
    getMyChargers,
    updateCharger,
    deleteCharger,
    getApprovedChargers,
    getChargerById,
    approveCharger,
} = require("../controllers/chargerController");

// Public routes: anyone can browse approved chargers
router.get("/approved", getApprovedChargers);
router.get("/approved/:id", getChargerById);

// Host-only routes: manage charger listings
router.post(
    "/",
    authenticateToken,
    authorizeHost,
    createCharger
);

router.get(
    "/my",
    authenticateToken,
    authorizeHost,
    getMyChargers
);

router.put(
    "/:id",
    authenticateToken,
    authorizeHost,
    updateCharger
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeHost,
    deleteCharger
);

// Admin-only route: approve charger listings
router.patch(
    "/:id/approve",
    authenticateToken,
    authorizeAdmin,
    approveCharger
);

module.exports = router;