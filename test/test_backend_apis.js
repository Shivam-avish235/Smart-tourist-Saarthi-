import { config } from 'dotenv';
import fetch from 'node-fetch';

config();

const BASE_URL = 'http://localhost:5000';
let authToken = '';

const testEndpoints = async () => {
    try {
        console.log('🧪 Starting API Tests');
        console.log('===================\n');

        // Test 1: Register a new tourist
        console.log('1️⃣ Testing Tourist Registration');
        const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test${Date.now()}@example.com`,
                password: 'Test123!@#',
                firstName: 'Test',
                lastName: 'User',
                dateOfBirth: '1990-01-01',
                nationality: 'Indian',
                phoneNumber: '+919876543210',
                documentType: 'Passport',
                documentNumber: 'P1234567'
            })
        });
        const registerData = await registerResponse.json();
        console.log(`   Status: ${registerResponse.status === 201 ? '✅' : '❌'}`);
        authToken = registerData.data.token;

        // Test 2: Login
        console.log('\n2️⃣ Testing Tourist Login');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: registerData.data.tourist.email,
                password: 'Test123!@#'
            })
        });
        console.log(`   Status: ${loginResponse.status === 200 ? '✅' : '❌'}`);

        // Test 3: Get Attractions
        console.log('\n3️⃣ Testing Attractions Endpoint');
        const attractionsResponse = await fetch(`${BASE_URL}/api/attractions`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const attractionsData = await attractionsResponse.json();
        console.log(`   Status: ${attractionsResponse.status === 200 ? '✅' : '❌'}`);
        console.log(`   Attractions found: ${attractionsData.data?.length || 0}`);

        // Test 4: Create Review
        console.log('\n4️⃣ Testing Review Creation');
        if (attractionsData.data?.length > 0) {
            const reviewResponse = await fetch(`${BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    attractionId: attractionsData.data[0]._id,
                    rating: 4,
                    title: 'Great Experience',
                    content: 'Really enjoyed visiting this place!',
                    visitDate: new Date().toISOString()
                })
            });
            console.log(`   Status: ${reviewResponse.status === 201 ? '✅' : '❌'}`);
        }

        // Test 5: Report Emergency
        console.log('\n5️⃣ Testing Emergency Reporting');
        const emergencyResponse = await fetch(`${BASE_URL}/api/emergency/panic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                type: 'Medical Emergency',
                description: 'Test emergency - please ignore',
                location: {
                    latitude: 12.9716,
                    longitude: 77.5946,
                    address: 'Test Location'
                }
            })
        });
        console.log(`   Status: ${emergencyResponse.status === 200 ? '✅' : '❌'}`);

        // Test 6: Get Safety Alerts
        console.log('\n6️⃣ Testing Safety Alerts');
        const alertsResponse = await fetch(`${BASE_URL}/api/safety/alerts`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const alertsData = await alertsResponse.json();
        console.log(`   Status: ${alertsResponse.status === 200 ? '✅' : '❌'}`);
        console.log(`   Alerts found: ${alertsData.data?.length || 0}`);

        // Test 7: Update Location
        console.log('\n7️⃣ Testing Location Update');
        const locationResponse = await fetch(`${BASE_URL}/api/location/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                latitude: 12.9716,
                longitude: 77.5946,
                accuracy: 10,
                address: 'Test Location'
            })
        });
        console.log(`   Status: ${locationResponse.status === 200 ? '✅' : '❌'}`);

        // Test 8: Health Check
        console.log('\n8️⃣ Testing Health Check');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        console.log(`   Status: ${healthResponse.status === 200 ? '✅' : '❌'}`);

        console.log('\n✅ All API tests completed!');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
};

testEndpoints();
