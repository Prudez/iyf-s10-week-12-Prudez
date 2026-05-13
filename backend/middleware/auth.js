const jwt = require('jsonwebtoken');
const config = require('../config/index');

const auth = (req, res, next) => {
    try {
        // Get token from request header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token, access denied' });
        }

        // Verify the token is valid
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = auth;