require('dotenv').config(); // 👈 must be first!
const app = require('./app');
const config = require('./config/index');

// =====================
// VALIDATE ENVIRONMENT VARIABLES
// =====================
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];

for (const varName of requiredVars) {
    if (!process.env[varName]) {
        console.error(`Error: ${varName} environment variable is required`);
        process.exit(1);
    }
}

// =====================
// START SERVER
// =====================
const PORT = config.port || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});