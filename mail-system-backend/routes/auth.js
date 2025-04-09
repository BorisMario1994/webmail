const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/db');
const { verifyPassword } = require('../utils/passwordUtils');

// Login route
router.post('/login', async (req, res) => {
    try {
        console.log
        const { userId, password } = req.body;
        console.log('Login attempt for user:', userId);
        console.log('Request body:', req.body);

        // Validate input
        if (!userId || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'UserID and password are required' 
            });
        }

        const pool = await poolPromise;
        console.log('Database pool connected');
        
        // Get user from database
        const result = await pool.request()
            .input('userId', userId)
            .query('SELECT UserID, Password, Salt, SUPERIOR, LVL FROM Users WHERE UserID = @userId');

        console.log('Database query result:', result.recordset);

        if (result.recordset.length === 0) {
            console.log('User not found in database');
            return res.status(401).json({ 
                success: false,
                message: 'Invalid UserID or password' 
            });
        }

        const user = result.recordset[0];
        console.log('User found:', {
            userId: user.UserID,
            salt: user.Salt,
            passwordType: typeof user.Password,
            isBuffer: Buffer.isBuffer(user.Password)
        });
        
        // Verify password using our custom hashing
        const isPasswordValid = verifyPassword(password, user.Salt, user.Password);
        console.log('Password verification result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Password validation failed');
            return res.status(401).json({ 
                success: false,
                message: 'Invalid UserID or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.UserID,
                superior: user.SUPERIOR,
                level: user.LVL
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    userId: user.UserID,
                    superior: user.SUPERIOR,
                    level: user.LVL
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false,
            message: 'Server error occurred',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get user hierarchy
router.get('/hierarchy/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await poolPromise;

        // Get user's superior
        const userResult = await pool.request()
            .input('userId', userId)
            .query('SELECT SUPERIOR FROM Users WHERE UserID = @userId');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const superiorId = userResult.recordset[0].SUPERIOR;

        // Get superior's details if exists
        let superior = null;
        if (superiorId) {
            const superiorResult = await pool.request()
                .input('superiorId', superiorId)
                .query('SELECT UserID, LVL FROM Users WHERE UserID = @superiorId');
            
            if (superiorResult.recordset.length > 0) {
                superior = superiorResult.recordset[0];
            }
        }

        // Get subordinates
        const subordinatesResult = await pool.request()
            .input('userId', userId)
            .query('SELECT UserID, LVL FROM Users WHERE SUPERIOR = @userId');

        res.json({
            user: { userId, superior: superiorId },
            superior,
            subordinates: subordinatesResult.recordset
        });
    } catch (error) {
        console.error('Hierarchy error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 