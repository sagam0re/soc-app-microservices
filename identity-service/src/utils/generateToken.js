const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

const generateToken = async (user) => {
    // Implementation for generating a token (e.g., JWT)
    const accessToken =  jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Refresh token valid for 7 days

    await RefreshToken.create({
        user: user._id,
        token: refreshToken,
        expiresAt
    });

    return { accessToken, refreshToken };
}

module.exports = generateToken;