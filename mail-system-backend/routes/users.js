const express = require('express');
const router = express.Router();
const { poolPromise } = require('../config/db');
const jwt = require('jsonwebtoken');

// Search users
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('query', `%${query}%`)
      .query(`
        SELECT UserID,LVL,Superior
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
        SELECT UserID ,LVL,Superior
        FROM Users
        ORDER BY UserID
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get current user's information
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', decoded.UserID)
      .query(`
        SELECT UserID, LVL, Superior
        FROM Users
        WHERE UserID = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

module.exports = router; 