const crypto = require('crypto');

function hashPassword(password, salt) {
    // Concatenate first 5 chars of salt + password + last 5 chars of salt
    const saltedPassword = salt.substring(0, 5) + password + salt.substring(5);
    
    // Create SHA2-256 hash
    const hash = crypto.createHash('sha256');
    hash.update(saltedPassword);
    
    // Return hash in hex format
    return '0x' + hash.digest('hex').toUpperCase();
}

function verifyPassword(password, salt, storedHash) {
    // If storedHash is a Buffer (varbinary), convert it to hex string
    const storedHashStr = Buffer.isBuffer(storedHash) 
        ? '0x' + storedHash.toString('hex').toUpperCase()
        : storedHash;
    
    const generatedHash = hashPassword(password, salt);
    return generatedHash === storedHashStr;
}

module.exports = {
    hashPassword,
    verifyPassword
}; 