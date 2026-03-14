const express = require('express');
const cors = require('cors');
require('dotenv').config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Replace app.use(cors()); with this:
app.use(cors({
  origin: 'https://online-issue-resolution-tracker-1.onrender.com', // Your frontend URL
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));

const db = require('./config/db');

db.query("SELECT 1")
  .then(() => console.log("✨ DB Connected"))
  .catch(err => console.log(err));

// Global Error Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));