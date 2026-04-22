const jwt = require("jsonwebtoken");
require("dotenv").config();
const config = require("../../config/config");

// Token generation function
const generateToken = (_id) => {
    const accessToken = jwt.sign(
        { _id }, // Payload
        config.JWT_SECRET, // Secret Key
        { expiresIn: "24h" } // Token expiry
    );

     const refreshToken = jwt.sign(
        { _id },
        config.JWT_REFRESH_SECRET, // separate secret for refresh token
        { expiresIn: "7d" } // longer validity
    );

    return {accessToken, refreshToken}
};

// Token verification middleware
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization"); // Expecting token in Authorization header

    if (!token) {
        return res.status(401).json({ status: "FAILED", message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded; // Attach decoded user info to request
        next(); // Proceed to next middleware/route
    } catch (error) {
        return res.status(403).json({ status: "FAILED", message: "Invalid or expired token" });
    }
};

// Verify Refresh Token
const verifyRefreshToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken, verifyRefreshToken  };
