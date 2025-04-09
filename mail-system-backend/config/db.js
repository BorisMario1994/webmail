const sql = require('mssql');
const config = require('./config');

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

// Create tables if they don't exist
const createTables = async () => {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
            CREATE TABLE Users (
                UserID VARCHAR(7) PRIMARY KEY,
                Name NVARCHAR(100) NOT NULL,
                Email NVARCHAR(100) UNIQUE NOT NULL,
                Password NVARCHAR(255) NOT NULL,
                CreatedAt DATETIME DEFAULT GETDATE()
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Mail')
            CREATE TABLE Mail (
                MailID INT IDENTITY(1,1) PRIMARY KEY,
                SenderID VARCHAR(7) NOT NULL,
                Subject NVARCHAR(200) NOT NULL,
                Body NVARCHAR(MAX) NOT NULL,
                CreatedAt DATETIME DEFAULT GETDATE(),
                IsDraft BIT DEFAULT 0,
                IsDeleted BIT DEFAULT 0,
                FOREIGN KEY (SenderID) REFERENCES Users(UserID)
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MailRecipients')
            CREATE TABLE MailRecipients (
                MailID INT NOT NULL,
                RecipientID VARCHAR(7) NOT NULL,
                IsRead BIT DEFAULT 0,
                ReadAt DATETIME,
                IsDeleted BIT DEFAULT 0,
                PRIMARY KEY (MailID, RecipientID),
                FOREIGN KEY (MailID) REFERENCES Mail(MailID),
                FOREIGN KEY (RecipientID) REFERENCES Users(UserID)
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Attachments')
            CREATE TABLE Attachments (
                AttachmentID INT IDENTITY(1,1) PRIMARY KEY,
                MailID INT NOT NULL,
                FileName NVARCHAR(255) NOT NULL,
                FilePath NVARCHAR(500) NOT NULL,
                FileSize INT NOT NULL,
                UploadedAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (MailID) REFERENCES Mail(MailID)
            );
        `);
        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

createTables();

module.exports = { poolPromise }; 