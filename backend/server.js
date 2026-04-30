const express = require('express');
const path = require('path');

const app = express();

// =====================
// API ROUTES (FIRST)
// =====================
app.use('/api/health', require('./routes/health'));

// (other API routes should also go here)
// app.use('/api/auth', require('./routes/auth'));

// =====================
// SERVE FRONTEND (PRODUCTION)
// =====================
app.use(express.static(path.join(__dirname, '../my-app/dist')));

// =====================
// REACT ROUTING (LAST)
// =====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/dist/index.html'));
});