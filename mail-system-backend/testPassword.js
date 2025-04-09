const { hashPassword, verifyPassword } = require('./utils/passwordUtils');

function testPassword() {
    const userId = 'MISW-04';
    const password = '255644';
    const salt = '6256T7158C';
    const expectedHash = '0xEE722970382A69A9F68AAE8943569802743EFE2FE89558A7F295BAD9364D34';
    
    // Test hashing
    const generatedHash = hashPassword(password, salt);
    console.log('\nPassword Hashing Test:');
    console.log('----------------------');
    console.log('User ID:', userId);
    console.log('Password:', password);
    console.log('Salt:', salt);
    console.log('Expected Hash:', expectedHash);
    console.log('Generated Hash:', generatedHash);
    console.log('Hashes Match:', generatedHash === expectedHash);
    
    // Test verification
    const isValid = verifyPassword(password, salt, expectedHash);
    console.log('\nPassword Verification Test:');
    console.log('---------------------------');
    console.log('Password is valid:', isValid);
}

testPassword(); 