// LCA Tool Diagnostic Script
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

console.log('🔍 LCA Tool Diagnostic Report');
console.log('================================');

// Check if .env file exists
const envPath = path.join(process.cwd(), 'server', '.env');
console.log('\n📁 Environment File Check:');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists in server directory');
} else {
  console.log('❌ .env file missing in server directory');
  console.log('   Create server/.env with the following content:');
  console.log('   PORT=5000');
  console.log('   MONGODB_URI=mongodb://localhost:27017/lca_database');
  console.log('   JWT_SECRET=lca-secret-key-12345');
  console.log('   NODE_ENV=development');
}

// Check if MongoDB is running
console.log('\n🗄️  MongoDB Check:');
try {
  const { stdout } = await execAsync('netstat -ano | findstr :27017');
  if (stdout.trim()) {
    console.log('✅ MongoDB appears to be running on port 27017');
  } else {
    console.log('❌ MongoDB not detected on port 27017');
  }
} catch (error) {
  console.log('❌ Could not check MongoDB status');
  console.log('   Please ensure MongoDB is installed and running');
}

// Check if server dependencies are installed
const serverPackagePath = path.join(process.cwd(), 'server', 'node_modules');
console.log('\n📦 Server Dependencies Check:');
if (fs.existsSync(serverPackagePath)) {
  console.log('✅ Server dependencies installed');
} else {
  console.log('❌ Server dependencies not installed');
  console.log('   Run: cd server && npm install');
}

// Check if frontend dependencies are installed
const frontendPackagePath = path.join(process.cwd(), 'node_modules');
console.log('\n🎨 Frontend Dependencies Check:');
if (fs.existsSync(frontendPackagePath)) {
  console.log('✅ Frontend dependencies installed');
} else {
  console.log('❌ Frontend dependencies not installed');
  console.log('   Run: npm install');
}

// Test server startup
console.log('\n🚀 Server Startup Test:');
try {
  const { stdout, stderr } = await execAsync('cd server && timeout 5 node server.js', { timeout: 6000 });
  if (stderr.includes('MongoDB connected')) {
    console.log('✅ Server can connect to MongoDB');
  } else if (stderr.includes('Server running')) {
    console.log('✅ Server starts successfully');
  } else {
    console.log('⚠️  Server startup output:', stderr || stdout);
  }
} catch (error) {
  if (error.message.includes('timeout')) {
    console.log('✅ Server appears to start (timeout reached)');
  } else {
    console.log('❌ Server startup failed:', error.message);
  }
}

console.log('\n🎯 Next Steps:');
console.log('1. Fix any ❌ issues above');
console.log('2. Run: npm run dev');
console.log('3. Open browser to http://localhost:3000');
console.log('4. Check browser console for any errors');
