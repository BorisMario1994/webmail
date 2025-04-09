const sql = require('mssql');
require('dotenv').config();

async function setupDatabase() {
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

        // Create Users table if it doesn't exist
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
            BEGIN
                CREATE TABLE Users (
                    UserID VARCHAR(7) PRIMARY KEY,
                    Password VARCHAR(64) NOT NULL,
                    Salt VARCHAR(10) NOT NULL,
                    SUPERIOR VARCHAR(7),
                    LVL INT,
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    UpdatedAt DATETIME DEFAULT GETDATE()
                );
                PRINT 'Users table created successfully';
            END
            ELSE
                PRINT 'Users table already exists';
        `);

        // Insert test user if not exists
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = 'MISW-04')
            BEGIN
                INSERT INTO Users (UserID, Password, Salt, SUPERIOR, LVL)
                VALUES (
                    'MISW-04',
                    '0xEE722970382A69A9F68AAE8943569802743EFE2FE89558A7F295BAD9364D34',
                    '6256T7158C',
                    NULL,
                    1
                );
                PRINT 'Test user MISW-04 inserted successfully';
            END
            ELSE
                PRINT 'Test user MISW-04 already exists';
        `);

        console.log('Database setup completed successfully');
        await pool.close();
    } catch (err) {
        console.error('Database setup failed:', err);
    }
}

setupDatabase(); 