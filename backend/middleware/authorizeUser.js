const authorizeUser = (req, res, next) => {
    if (!req.user || req.user.role !== "user") {
        return res.status(403).json({
            message: "Access denied. Driver privileges are required.",
        });
    }

    next();
};

module.exports = authorizeUser;