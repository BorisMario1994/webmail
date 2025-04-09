-- Create Users table
CREATE TABLE Users (
    UserID VARCHAR(7) PRIMARY KEY,
    Password VARCHAR(64) NOT NULL,
    Salt VARCHAR(10) NOT NULL,
    SUPERIOR VARCHAR(7),
    LVL INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Insert test user
INSERT INTO Users (UserID, Password, Salt, SUPERIOR, LVL)
VALUES (
    'MISW-04',
    '0xEE722970382A69A9F68AAE8943569802743EFE2FE89558A7F295BAD9364D34',
    '6256T7158C',
    NULL,
    1
);

-- Create function to hash passwords
CREATE FUNCTION HashPassword(@password VARCHAR(50), @salt VARCHAR(10))
RETURNS VARCHAR(64)
AS
BEGIN
    DECLARE @saltedPassword VARCHAR(60)
    SET @saltedPassword = SUBSTRING(@salt, 1, 5) + @password + SUBSTRING(@salt, 6, 5)
    RETURN '0x' + UPPER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @saltedPassword), 2))
END;

-- Example usage of the function
SELECT dbo.HashPassword('255644', '6256T7158C') AS HashedPassword; 