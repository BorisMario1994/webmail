const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mailRoutes = require('./routes/mail');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request body:', req.body);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/users', userRoutes);

// Basic route for testing
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Server error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the server: http://localhost:${PORT}/test`);
    console.log(`Login endpoint: http://localhost:${PORT}/api/auth/login`);
}); 