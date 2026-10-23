const authorizeHost = (req, res, next) => {
    if (!req.user || req.user.role !== "host") {
        return res.status(403).json({
            message: "Access denied. Host privileges are required.",
        });
    }

    next();
};

module.exports = authorizeHost;