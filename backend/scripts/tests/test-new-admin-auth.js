import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
    console.log('--------------------------------------------------');
    console.log('STARTING SECURE ADMIN AUTH PROTOCOL VERIFICATION');
    console.log('--------------------------------------------------');

    try {
        // Test 1: Username & Password Authentication
        console.log('\n[TEST 1] Initiating Username Auth for admin...');
        const loginUserRes = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loginType: 'username',
                username: 'admin',
                password: 'admin123'
            })
        });

        console.log('Status Code:', loginUserRes.status);
        const dataUser = await loginUserRes.json();
        if (loginUserRes.ok && dataUser.success) {
            console.log('✅ Username Auth Success!');
            console.log('Returned Token:', dataUser.token.substring(0, 30) + '...');
            console.log('Admin Data:', JSON.stringify(dataUser.adminData));
        } else {
            console.error('❌ Username Auth Failed:', dataUser.message);
        }

        // Test 2: Gmail & Password Authentication
        console.log('\n[TEST 2] Initiating Gmail ID Auth for admin...');
        const loginGmailRes = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loginType: 'gmail',
                gmail: 'admin@gmail.com',
                password: 'admin123'
            })
        });

        console.log('Status Code:', loginGmailRes.status);
        const dataGmail = await loginGmailRes.json();
        if (loginGmailRes.ok && dataGmail.success) {
            console.log('✅ Gmail Auth Success!');
            console.log('Returned Token:', dataGmail.token.substring(0, 30) + '...');
            console.log('Admin Data:', JSON.stringify(dataGmail.adminData));
        } else {
            console.error('❌ Gmail Auth Failed:', dataGmail.message);
        }

        // Test 3: Session Validation using protected endpoint
        if (dataUser.success && dataUser.token) {
            console.log('\n[TEST 3] Testing Protected Session Verification with valid token...');
            const sessionRes = await fetch(`${API_BASE}/admin/session`, {
                headers: {
                    'Authorization': `Bearer ${dataUser.token}`
                }
            });

            console.log('Status Code:', sessionRes.status);
            const sessionData = await sessionRes.json();
            if (sessionRes.ok && sessionData.success) {
                console.log('✅ Session Validation Verified! Admin profile payload:', JSON.stringify(sessionData.adminData));
            } else {
                console.error('❌ Session Validation Failed:', sessionData.message);
            }
        }

        // Test 4: Invalid Password Attempt
        console.log('\n[TEST 4] Simulating Authentication Failure (incorrect password)...');
        const loginFailRes = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loginType: 'username',
                username: 'admin',
                password: 'wrongpassword'
            })
        });

        console.log('Status Code:', loginFailRes.status);
        const failData = await loginFailRes.json();
        if (loginFailRes.status === 401) {
            console.log('✅ Correctly Rejected! Message:', failData.message);
        } else {
            console.error('❌ Unexpected response code:', loginFailRes.status);
        }

    } catch (error) {
        console.error('Test Execution Failed with Error:', error.message);
    }

    console.log('\n--------------------------------------------------');
    console.log('VERIFICATION PROCEDURE COMPLETED');
    console.log('--------------------------------------------------');
}

runTests();
