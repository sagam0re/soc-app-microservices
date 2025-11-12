const generateToken = require('../utils/generateToken');
const logger = require('../utils/logger');
const { validateRegistration, validateLogin } = require('../utils/validation');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');


const registerUser = async (req, res) => {
    try {
        // Registration logic here

        
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn(`Validation Error: ${error.details[0].message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
            return res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
        }

        const {password, username, email} = req.body;

        let user = await User.findOne({ $or: [ { email }, { username } ] });
        if (user) {
            logger.warn(`Registration Error: User already exists - ${req.method} ${req.originalUrl} - ${req.ip}`);
            return res.status(400).json({ error: 'User already exists' });
        }

        user = new User({ username, email, password });
        await user.save();

        const {accessToken, refreshToken} = await generateToken(user);
        res.status(201).json({ 
            success: true,
            message: 'User registered successfully', 
            user_id: user._id, 
            token: {
                accessToken, refreshToken
            }
        });
    } catch (err) {
        logger.error(`Registration Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
        res.status(500).json({success: false, error: 'Registration failed' });
    }
}

const loginUser = async (req, res) => {
    // Login logic here

    try {
        const { email, password } = req.body;

        const { error } = validateLogin(req.body);
        if (error) {
            logger.warn(`Validation Error: ${error.details[0].message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            logger.warn(`Login Error: Invalid credentials - ${req.method} ${req.originalUrl} - ${req.ip}`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const { accessToken, refreshToken } = await generateToken(user);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user_id: user._id,
            token: {
                accessToken, refreshToken
            }
        });
    } catch (err) {
        logger.error(`Login Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
}

const refreshTokenUser = async (req, res) => {
    // Token refresh logic here
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn(`Refresh Token Error: No refresh token provided - ${req.method} ${req.originalUrl} - ${req.ip}`);
            return res.status(400).json({ success: false, error: 'No refresh token provided' });
        }
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken || storedToken.expiryDate < new Date()) {
            logger.warn(`Refresh Token Error: Invalid refresh token - ${req.method} ${req.originalUrl} - ${req.ip}`);
            return res.status(401).json({ success: false, error: 'Invalid refresh token' });
        }

        const user = await User.findById(storedToken.user);
        if (!user) {
            logger.warn(`Refresh Token Error: User not found for refresh token - ${req.method} ${req.originalUrl} - ${req.ip}`);
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const tokens = await generateToken(user, refreshToken);

        await RefreshToken.deleteOne({ _id: storedToken._id });

        res.status(200).json({ 
            success: true,
            message: 'Token refreshed successfully', 
            token: tokens 
        });
    } catch (err) {
        logger.error(`Refresh Token Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
        res.status(500).json({ success: false, error: 'Token refresh failed' });
    }
}

const logout = async (req, res) => {
    // Logout logic here
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn(`Logout Error: No refresh token provided - ${req.method} ${req.originalUrl} - ${req.ip}`);
            return res.status(400).json({ success: false, error: 'No refresh token provided' });
        }
        await RefreshToken.deleteOne({ token: refreshToken });
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        logger.error(`Logout Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
        res.status(500).json({ success: false, error: 'Logout failed' });
    }
}
module.exports = { registerUser, loginUser, refreshTokenUser, logout };