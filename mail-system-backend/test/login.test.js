const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testLogin() {
    try {
        // Test case 1: Valid credentials
        console.log('\n1. Testing with valid credentials...');
        const validResponse = await axios.post(`${API_URL}/login`, {
            userId: 'MISW-01',
            password: 'test123'
        });
        console.log('Response:', JSON.stringify(validResponse.data, null, 2));

        // Test case 2: Missing password
        console.log('\n2. Testing with missing password...');
        try {
            await axios.post(`${API_URL}/login`, {
                userId: 'MISW-01'
            });
        } catch (error) {
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        }

        // Test case 3: Invalid password
        console.log('\n3. Testing with invalid password...');
        try {
            await axios.post(`${API_URL}/login`, {
                userId: 'MISW-01',
                password: 'wrongpassword'
            });
        } catch (error) {
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        }

        // Test case 4: Non-existent user
        console.log('\n4. Testing with non-existent user...');
        try {
            await axios.post(`${API_URL}/login`, {
                userId: 'NONEXISTENT',
                password: 'test123'
            });
        } catch (error) {
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testLogin(); 