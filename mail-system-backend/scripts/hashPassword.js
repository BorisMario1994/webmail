const bcrypt = require('bcryptjs');

async function hashPassword() {
    const password = 'test123';
    const saltRounds = 10;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Original password:', password);
        console.log('Hashed password:', hash);
        
        // Verify the hash
        const isValid = await bcrypt.compare(password, hash);
        console.log('Password verification:', isValid);
    } catch (error) {
        console.error('Error:', error);
    }
}

hashPassword(); 