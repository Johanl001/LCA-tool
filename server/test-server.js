// Test server startup
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/lca_database';
process.env.PORT = '5000';

console.log('🧪 Testing server startup...');
console.log('Environment variables set:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

try {
  // Import and start the server
  import('./server.js');
} catch (error) {
  console.error('❌ Server startup failed:', error);
}
