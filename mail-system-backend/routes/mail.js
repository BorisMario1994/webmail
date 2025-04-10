const express = require('express');
const router = express.Router();
const { poolPromise } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB per file
    files: 10 // Maximum 10 files
  }
});

// Get all mails for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', req.user.UserID)
      .query(`
        SELECT m.*, 
               s.Name as SenderName,
               s.Email as SenderEmail,
               mr.IsRead,
               mr.ReadAt
        FROM Mail m
        JOIN Users s ON m.SenderID = s.UserID
        JOIN MailRecipients mr ON m.MailID = mr.MailID
        WHERE mr.RecipientID = @userId AND mr.IsDeleted = 0
        ORDER BY m.CreatedAt DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching mails:', error);
    res.status(500).json({ error: 'Failed to fetch mails' });
  }
});

// Send new mail with attachments
router.post('/', authenticateToken, upload.array('attachments'), async (req, res) => {
  try {
    // Log the decoded token and user information
    console.log('Decoded token:', req.user);
    console.log('User information:', req.user);

    const { recipients, subject, body, isDraft } = req.body;
    
    // Log the processed form data
    console.log('Processed form data:', {
      recipients,
      subject,
      body,
      isDraft,
      files: req.files ? req.files.length : 0
    });
    
    if (!recipients || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.user.userId) {
      return res.status(401).json({ error: 'Invalid user information' });
    }

    const senderId = req.user.userId;
    const pool = await poolPromise;

    // Start transaction
    const transaction = await pool.transaction();
    await transaction.begin();

    try {
      // Insert mail record
      const mailResult = await transaction.request()
        .input('senderId', senderId)
        .input('subject', subject)
        .input('body', body)
        .input('isDraft', isDraft === 'true')
        .query(`
          INSERT INTO Mail (SenderID, Subject, Body, IsDraft)
          OUTPUT INSERTED.MailID
          VALUES (@senderId, @subject, @body, @isDraft)
        `);

      const mailId = mailResult.recordset[0].MailID;

      // Insert recipients
      const recipientList = recipients.split(',').map(r => r.trim());
      for (const recipientId of recipientList) {
        await transaction.request()
          .input('mailId', mailId)
          .input('recipientId', recipientId)
          .query(`
            INSERT INTO MailRecipients (MailID, RecipientID)
            VALUES (@mailId, @recipientId)
          `);
      }

      // Handle attachments if any
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await transaction.request()
            .input('mailId', mailId)
            .input('fileName', file.originalname)
            .input('filePath', file.path)
            .input('fileSize', file.size)
            .query(`
              INSERT INTO Attachments (MailID, FileName, FilePath, FileSize)
              VALUES (@mailId, @fileName, @filePath, @fileSize)
            `);
        }
      }

      // Commit transaction
      await transaction.commit();
      res.status(201).json({ message: 'Mail sent successfully' });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error sending mail:', error);
    res.status(500).json({ error: 'Failed to send mail' });
  }
});

// Save mail as draft
router.post('/draft', authenticateToken, upload.array('attachments'), async (req, res) => {
  try {
    const { recipients, subject, body } = req.body;
    const senderId = req.user.userId;
    const pool = await poolPromise;

    // Start transaction
    const transaction = await pool.transaction();
    await transaction.begin();

    try {
      // Insert draft mail record
      const mailResult = await transaction.request()
        .input('senderId', senderId)
        .input('subject', subject)
        .input('body', body)
        .input('isDraft', true)
        .query(`
          INSERT INTO Mail (SenderID, Subject, Body, IsDraft)
          OUTPUT INSERTED.MailID
          VALUES (@senderId, @subject, @body, @isDraft)
        `);

      const mailId = mailResult.recordset[0].MailID;

      // Insert recipients
      const recipientList = recipients.split(',').map(r => r.trim());
      for (const recipientId of recipientList) {
        await transaction.request()
          .input('mailId', mailId)
          .input('recipientId', recipientId)
          .query(`
            INSERT INTO MailRecipients (MailID, RecipientID)
            VALUES (@mailId, @recipientId)
          `);
      }

      // Handle attachments if any
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await transaction.request()
            .input('mailId', mailId)
            .input('fileName', file.originalname)
            .input('filePath', file.path)
            .input('fileSize', file.size)
            .query(`
              INSERT INTO Attachments (MailID, FileName, FilePath, FileSize)
              VALUES (@mailId, @fileName, @filePath, @fileSize)
            `);
        }
      }

      // Commit transaction
      await transaction.commit();
      res.status(201).json({ message: 'Draft saved successfully' });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Validate recipients
router.post('/validate-recipients', async (req, res) => {
  try {
    const { recipients } = req.body;
    const recipientList = recipients.split(',').map(r => r.trim()).filter(Boolean);
    
    console.log('User information:', recipientList);
    if (recipientList.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('recipients', recipientList.join(','))
      .query(`
        SELECT UserID
        FROM Users
        WHERE UserID IN (SELECT value FROM STRING_SPLIT(@recipients, ','))
      `);

    const validRecipients = result.recordset;
    const invalidRecipients = recipientList.filter(
      recipient => !validRecipients.some(r => r.UserID === recipient)
    );

    if (invalidRecipients.length > 0) {
      return res.status(400).json({
        error: 'Invalid recipients found',
        invalidRecipients,
        validRecipients
      });
    }

    res.json({ validRecipients });
  } catch (error) {
    console.error('Error validating recipients:', error);
    res.status(500).json({ error: 'Failed to validate recipients' });
  }
});

module.exports = router; 