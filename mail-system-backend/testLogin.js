require('dotenv').config();
const sql = require('mssql');
const { verifyPassword } = require('./utils/passwordUtils');

async function testLogin() {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    };

    try {
        console.log('Connecting to database...');
        const pool = await new sql.ConnectionPool(config).connect();
        console.log('Connected successfully!');

        // Test user credentials
        const testUserId = 'MISW-04';
        const testPassword = '255644';

        // Get user from database
        const result = await pool.request()
            .input('userId', testUserId)
            .query('SELECT * FROM Users WHERE UserID = @userId');

        console.log('\nQuery result:', result.recordset);

        if (result.recordset.length === 0) {
            console.log('User not found!');
            return;
        }

        const user = result.recordset[0];
        console.log('\nFound user:', {
            userId: user.UserID,
            passwordHash: user.Password,
            salt: user.Salt,
            superior: user.SUPERIOR,
            level: user.LVL
        });

        // Test password comparison
        const isPasswordValid = verifyPassword(testPassword, user.Salt, user.Password);
        console.log('\nPassword test:', {
            inputPassword: testPassword,
            storedHash: user.Password,
            salt: user.Salt,
            isValid: isPasswordValid
        });

        await pool.close();
        console.log('\nDatabase connection closed.');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testLogin(); 