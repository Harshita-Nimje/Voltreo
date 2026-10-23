const pool = require("../db");

const createCharger = async (req, res) => {
    try {
        const {
            title,
            description,
            address,
            latitude,
            longitude,
            charger_type,
            power_kw,
            price_per_hour,
        } = req.body;

        if (
            !title ||
            !address ||
            latitude == null ||
            longitude == null ||
            !charger_type ||
            power_kw == null ||
            price_per_hour == null
        ) {
            return res.status(400).json({
                message: "Please provide all required charger details.",
            });
        }

        const result = await pool.query(
            `INSERT INTO chargers (
        host_id,
        title,
        description,
        address,
        latitude,
        longitude,
        charger_type,
        power_kw,
        price_per_hour
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
            [
                req.user.id,
                title.trim(),
                description || null,
                address.trim(),
                latitude,
                longitude,
                charger_type,
                power_kw,
                price_per_hour,
            ]
        );

        return res.status(201).json({
            message: "Charger listing created successfully!",
            charger: result.rows[0],
        });
    } catch (error) {
        console.error("Create charger error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while creating the charger listing.",
        });
    }
};
const getMyChargers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
       FROM chargers
       WHERE host_id = $1
       ORDER BY created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            chargers: result.rows,
        });
    } catch (error) {
        console.error("Fetch chargers error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while fetching your chargers.",
        });
    }
};
const updateCharger = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            address,
            latitude,
            longitude,
            charger_type,
            power_kw,
            price_per_hour,
        } = req.body;

        if (
            !title ||
            !address ||
            latitude == null ||
            longitude == null ||
            !charger_type ||
            power_kw == null ||
            price_per_hour == null
        ) {
            return res.status(400).json({
                message: "Please provide all required charger details.",
            });
        }

        const result = await pool.query(
            `UPDATE chargers
       SET title = $1,
           description = $2,
           address = $3,
           latitude = $4,
           longitude = $5,
           charger_type = $6,
           power_kw = $7,
           price_per_hour = $8
       WHERE id = $9 AND host_id = $10
       RETURNING *`,
            [
                title.trim(),
                description || null,
                address.trim(),
                latitude,
                longitude,
                charger_type,
                power_kw,
                price_per_hour,
                id,
                req.user.id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Charger listing not found or you do not own it.",
            });
        }

        return res.status(200).json({
            message: "Charger listing updated successfully!",
            charger: result.rows[0],
        });
    } catch (error) {
        console.error("Update charger error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while updating the charger listing.",
        });
    }
};

const deleteCharger = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM chargers
       WHERE id = $1 AND host_id = $2
       RETURNING id, title`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Charger listing not found or you do not own it.",
            });
        }

        return res.status(200).json({
            message: "Charger listing deleted successfully!",
            charger: result.rows[0],
        });
    } catch (error) {
        console.error("Delete charger error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while deleting the charger listing.",
        });
    }
};

const getApprovedChargers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
         c.id,
         c.host_id,
         c.title,
         c.description,
         c.address,
         c.latitude,
         c.longitude,
         c.charger_type,
         c.power_kw,
         c.price_per_hour,
         c.created_at
       FROM chargers c
       WHERE c.status = 'approved'
       ORDER BY c.created_at DESC`
        );

        return res.status(200).json({
            chargers: result.rows,
        });
    } catch (error) {
        console.error("Fetch approved chargers error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while fetching available chargers.",
        });
    }
};

const getChargerById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
         c.id,
         c.title,
         c.description,
         c.address,
         c.latitude,
         c.longitude,
         c.charger_type,
         c.power_kw,
         c.price_per_hour,
         c.status,
         c.created_at,
         u.name AS host_name
       FROM chargers c
       JOIN users u ON c.host_id = u.id
       WHERE c.id = $1
         AND c.status = 'approved'`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Approved charger listing not found.",
            });
        }

        return res.status(200).json({
            charger: result.rows[0],
        });
    } catch (error) {
        console.error("Fetch charger details error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while fetching charger details.",
        });
    }
};

const approveCharger = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE chargers
       SET status = 'approved'
       WHERE id = $1
         AND status = 'pending'
       RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pending charger listing not found.",
            });
        }

        return res.status(200).json({
            message: "Charger approved successfully.",
            charger: result.rows[0],
        });
    } catch (error) {
        console.error("Approve charger error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while approving the charger.",
        });
    }
};

module.exports = { createCharger, getMyChargers, updateCharger, deleteCharger, getApprovedChargers, getChargerById, approveCharger };