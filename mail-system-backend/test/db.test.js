require('dotenv').config();
const sql = require('mssql');

async function testConnection() {
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
        console.log('Attempting to connect to database...');
        console.log('Server:', process.env.DB_SERVER);
        console.log('Database:', process.env.DB_DATABASE);
        
        const pool = await new sql.ConnectionPool(config).connect();
        console.log('Successfully connected to database!');

        // Test query to check if Users table exists and get its structure
        const result = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Users'
        `);

        if (result.recordset.length > 0) {
            console.log('\nUsers table structure:');
            console.table(result.recordset);

            // Test query to get user count
            const userCount = await pool.request().query('SELECT COUNT(*) as count FROM Users');
            console.log('\nNumber of users in database:', userCount.recordset[0].count);

            // Test query to get all users
            const users = await pool.request().query('SELECT UserID, Password, Salt, SUPERIOR, LVL FROM Users');
            console.log('\nUsers in database:');
            console.table(users.recordset);
        } else {
            console.log('\nUsers table not found!');
        }

        await pool.close();
        console.log('\nDatabase connection closed.');
    } catch (err) {
        console.error('Database test failed!');
        console.error('Error:', err);
    }
}

testConnection(); 