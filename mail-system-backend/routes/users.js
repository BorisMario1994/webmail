const express = require('express');
const router = express.Router();
const { poolPromise } = require('../config/db');
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  //console.log('=== Token Verification Debug ===');
  //console.log('1. Authorization header:', authHeader);
 // console.log('2. Extracted token:', token);

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   // console.log('3. Decoded token:', decoded);
   // console.log('4. UserID from token:', decoded.userId);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('5. Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Get current user's information
router.get('/me', authenticateToken, async (req, res) => {
  try {
   // console.log('=== User Info Fetch Debug ===');
   // console.log('1. Request user object:', req.user);
    console.log('2. UserID from request:', req.user.userId);
    
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', req.user.userId)
      .query(`
        SELECT UserID, LVL, SUPERIOR
        FROM Users
        WHERE UserID = @userId
      `);

    console.log('3. Database query result:', result.recordset);
    if (result.recordset.length === 0) {
      console.log('4. No user found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('5. Found user:', result.recordset[0]);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('6. Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('query', `%${query}%`)
      .query(`
        SELECT  UserID,LVL,SUPERIOR
        FROM Users
        WHERE UserID LIKE @query 
        ORDER BY UserID
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT UserID,LVL,SUPERIOR
        FROM Users
        ORDER BY UserID
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router; 