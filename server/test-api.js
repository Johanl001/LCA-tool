import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔧 API Key Test Script');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? `${process.env.OPENROUTER_API_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('OPENROUTER_BASE_URL:', process.env.OPENROUTER_BASE_URL || 'NOT SET');
console.log('OPENROUTER_MODEL:', process.env.OPENROUTER_MODEL || 'NOT SET');

if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY is not set!');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "LCA_TOOL"
  }
});

async function testAPI() {
  try {
    console.log('🧪 Testing OpenRouter API...');
    
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b:free',
      messages: [{ role: 'user', content: 'Hello! Just testing the connection. Please respond with \"API is working!\"' }],
      max_tokens: 50
    });

    console.log('✅ API Response:', completion.choices[0].message.content);
    console.log('🎉 OpenRouter API is working correctly!');
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error code:', error.code);
    
    if (error.status === 401) {
      console.error('🔑 Authentication failed - check your API key');
    } else if (error.status === 429) {
      console.error('⏰ Rate limit exceeded - try again later');
    } else if (error.status === 400) {
      console.error('📝 Bad request - check your model name and parameters');
    }
  }
}

testAPI();