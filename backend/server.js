const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));

const db = require('./config/db');
db.query("SELECT 1").then(() => console.log("✨ DB Connected")).catch(err => console.log(err));

// Global Error Middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the full error for you to see in the terminal
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        // Only show error stack in development mode
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

app.listen(process.env.PORT, () => console.log(`✅ Server running on ${process.env.PORT}`));