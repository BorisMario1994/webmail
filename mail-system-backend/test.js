const crypto = require('crypto');

function hashPassword(password, salt) {
    const saltedPassword = salt.substring(0, 5) + password + salt.substring(5);
    const hash = crypto.createHash('sha256');
    hash.update(saltedPassword);
    return '0x' + hash.digest('hex').toUpperCase();
}

// Test data
const userId = 'MISW-04';
const password = '255644';
const salt = '6256T7158C';
const expectedHash = '0xEE722970E3828A69A9F68AAE8943569802743EFE2FE89558A7F295BAD9364D34';

// Test hashing
const generatedHash = hashPassword(password, salt);
console.log('Test Results:');
console.log('------------');
console.log('User ID:', userId);
console.log('Password:', password);
console.log('Salt:', salt);
console.log('Expected Hash:', expectedHash);
console.log('Generated Hash:', generatedHash);
console.log('Hashes Match:', generatedHash === expectedHash); 