require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];

for (const varName of requiredVars) {
    if (!process.env[varName]) {
        console.error(`Error: ${varName} environment variable is required`);
        process.exit(1);
    }
}

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});