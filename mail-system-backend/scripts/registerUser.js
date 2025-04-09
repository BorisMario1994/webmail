const { poolPromise } = require('../config/db');
const { hashPassword } = require('../utils/passwordUtils');
require('dotenv').config();

async function registerUser(userId, password, superior = null, level = 1) {
    try {
        // Generate a random salt (10 characters)
        const salt = Math.random().toString(36).substring(2, 12).toUpperCase();
        
        // Hash the password
        const hashedPassword = hashPassword(password, salt);
        
        const pool = await poolPromise;
        
        // Insert the new user
        const result = await pool.request()
            .input('userId', userId)
            .input('password', hashedPassword)
            .input('salt', salt)
            .input('superior', superior)
            .input('level', level)
            .query(`
                INSERT INTO Users (UserID, Password, Salt, SUPERIOR, LVL)
                VALUES (@userId, @password, @salt, @superior, @level)
            `);
            
        console.log('User registered successfully:', {
            userId,
            salt,
            hashedPassword
        });
        
        return true;
    } catch (error) {
        console.error('Error registering user:', error);
        return false;
    }
}

// Example usage
if (require.main === module) {
    const userId = process.argv[2];
    const password = process.argv[3];
    const superior = process.argv[4] || null;
    const level = parseInt(process.argv[5]) || 1;
    
    if (!userId || !password) {
        console.log('Usage: node registerUser.js <userId> <password> [superior] [level]');
        process.exit(1);
    }
    
    registerUser(userId, password, superior, level)
        .then(success => {
            if (success) {
                console.log('Registration completed successfully');
            } else {
                console.log('Registration failed');
            }
            process.exit(0);
        });
} 