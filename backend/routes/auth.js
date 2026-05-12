const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/index');

// =====================
// REGISTER
// POST /api/auth/register
// =====================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already taken' });
        }

        // Create new user
        const user = new User({ username, email, password });
        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// LOGIN
// POST /api/auth/login
// =====================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// GET CURRENT USER
// GET /api/auth/me
// =====================
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;