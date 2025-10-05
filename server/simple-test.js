// Simple server test without MongoDB
import express from 'express';
import cors from 'cors';

console.log('🧪 Starting simple server test...');

const app = express();
const PORT = 5001; // Use different port to avoid conflicts

app.use(cors());
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple test server is running',
    timestamp: new Date().toISOString()
  });
});

// Simple projects endpoint (mock data)
app.get('/api/process/all', (req, res) => {
  const mockProjects = [
    {
      projectId: 'test-001',
      projectName: 'Test Aluminum Project',
      sustainabilityScore: 75,
      circularScore: 85,
      linearScore: 45,
      timestamp: new Date().toISOString()
    }
  ];
  
  console.log('📦 Returning mock projects:', mockProjects);
  res.json(mockProjects);
});

app.listen(PORT, () => {
  console.log(`✅ Simple test server running on port ${PORT}`);
  console.log(`🌐 Test it: http://localhost:${PORT}/api/health`);
  console.log(`📊 Projects: http://localhost:${PORT}/api/process/all`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down simple test server...');
  process.exit(0);
});
