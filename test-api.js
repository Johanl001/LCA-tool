// Test API endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing LCA API Endpoints...\n');
  
  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    console.log('✅ Health check:', data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('   Make sure the server is running: npm run dev');
    return;
  }
  
  // Test 2: Register a test user
  console.log('\n2️⃣ Testing user registration...');
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };
  
  let authToken = null;
  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ User registered successfully');
      authToken = data.token;
    } else {
      console.log('⚠️  Registration response:', data);
      // Try login instead
      console.log('   Trying login...');
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password })
      });
      const loginData = await loginResponse.json();
      if (loginResponse.ok) {
        console.log('✅ User logged in successfully');
        authToken = loginData.token;
      }
    }
  } catch (error) {
    console.log('❌ Auth failed:', error.message);
  }
  
  // Test 3: Fetch projects
  console.log('\n3️⃣ Testing projects endpoint...');
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_BASE}/api/process/all`, { headers });
    const projects = await response.json();
    
    console.log('✅ Projects endpoint response:', projects);
    console.log('📊 Number of projects:', Array.isArray(projects) ? projects.length : 'Not an array');
    
    if (Array.isArray(projects) && projects.length > 0) {
      console.log('📋 First project:', {
        id: projects[0].projectId,
        name: projects[0].projectName,
        timestamp: projects[0].timestamp
      });
    }
  } catch (error) {
    console.log('❌ Projects fetch failed:', error.message);
  }
  
  // Test 4: Create sample data
  console.log('\n4️⃣ Testing sample data creation...');
  if (authToken) {
    try {
      const response = await fetch(`${API_BASE}/api/process/create-sample`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      console.log('✅ Sample data creation:', data);
    } catch (error) {
      console.log('❌ Sample data creation failed:', error.message);
    }
  }
  
  console.log('\n🎯 Test Summary:');
  console.log('If all tests passed, your API is working correctly!');
  console.log('If you see projects, they should appear in your dashboard.');
  console.log('If not, check the browser console for frontend errors.');
}

// Run the test
testAPI().catch(console.error);
