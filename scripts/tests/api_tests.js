const API_URL = 'http://localhost:5000/api';

const credentials = {
  superadmin: { email: 'manan12345ch@gmail.com', password: 'admin123hostelA' },
  admin: { email: 'admin.a@messpro.com', password: 'Iop5Zwb9Ink' },
  manager: { email: 'manager.a@messpro.com', password: '4Lz_ETFRE-U' },
};

async function loginAndGetCookie(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const setCookieHeader = res.headers.get('set-cookie');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    console.log(`[SUCCESS] Logged in as ${email}`);
    // extract first cookie
    if (setCookieHeader) {
      return setCookieHeader.split(';')[0]; // just grab the token part
    }
    return null;
  } catch (error) {
    console.log(`[ERROR] Failed to login as ${email}:`, error.message);
    return null;
  }
}

async function testEndpoint(name, method, url, cookie, bodyData = null) {
  try {
    const options = {
      method,
      headers: { 
        Cookie: cookie,
        'Content-Type': 'application/json' 
      }
    };
    if (bodyData) options.body = JSON.stringify(bodyData);

    const res = await fetch(`${API_URL}${url}`, options);
    const data = await res.json();
    if (!res.ok) {
      console.log(`[FAIL] ${name} - Status: ${res.status} - ${data.message || 'Error'}`);
      return { success: false, status: res.status };
    }
    console.log(`[OK] ${name}`);
    return { success: true, data };
  } catch (error) {
    console.log(`[FAIL] ${name} - Exception: ${error.message}`);
    return { success: false };
  }
}

async function runTests() {
  console.log("=== STARTING API TESTS ===");
  
  for (const [role, creds] of Object.entries(credentials)) {
    console.log(`\n--- Testing Role: ${role.toUpperCase()} ---`);
    const cookie = await loginAndGetCookie(creds.email, creds.password);
    if (!cookie) continue;

    // 1. Hostel Tests
    await testEndpoint('Get Hostels', 'GET', '/hostels', cookie);
    await testEndpoint('Get My Hostel', 'GET', '/hostels/my-hostel', cookie);
    
    // 2. Residence Tests
    await testEndpoint('Get Rooms', 'GET', '/residence', cookie);
    // Create room (role should not matter for the API call execution, we just see if it succeeds or fails)
    await testEndpoint('Create Room', 'POST', '/residence', cookie, { roomNumber: `R_${role}_101`, capacity: 2 });
    
    // 3. User Tests
    await testEndpoint('Get Targeted Users', 'GET', '/users', cookie);
    
    // 4. Meal Settings Tests
    await testEndpoint('Get Meal Schedule', 'GET', '/meal-schedule', cookie);
  }
}

runTests();
