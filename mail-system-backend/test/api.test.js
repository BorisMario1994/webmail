const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testLoginAPI() {
    console.log('Starting API tests...\n');

    // Test case 1: Valid credentials
    console.log('Test Case 1: Valid credentials');
    console.log('------------------------------');
    try {
        const response = await axios.post(`${API_URL}/login`, {
            userId: 'MISW-01',
            password: 'test123'
        });
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }

    // Test case 2: Invalid password
    console.log('\nTest Case 2: Invalid password');
    console.log('------------------------------');
    try {
        const response = await axios.post(`${API_URL}/login`, {
            userId: 'MISW-01',
            password: 'wrongpassword'
        });
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }

    // Test case 3: Non-existent user
    console.log('\nTest Case 3: Non-existent user');
    console.log('------------------------------');
    try {
        const response = await axios.post(`${API_URL}/login`, {
            userId: 'NONEXISTENT',
            password: 'test123'
        });
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }

    // Test case 4: Missing password
    console.log('\nTest Case 4: Missing password');
    console.log('------------------------------');
    try {
        const response = await axios.post(`${API_URL}/login`, {
            userId: 'MISW-01'
        });
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the tests
testLoginAPI().catch(error => {
    console.error('Test suite failed:', error);
}); 