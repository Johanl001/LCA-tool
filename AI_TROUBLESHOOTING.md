# 🤖 AI Assistant Troubleshooting Guide

## 🔧 **Current Configuration**
- **Model**: `openai/gpt-oss-20b:free` (OpenRouter)
- **API Provider**: OpenRouter (https://openrouter.ai)
- **Configuration File**: `server/.env`

## 🚨 **Common Issues & Solutions**

### **1. AI Assistant Not Responding**

**Symptoms:**
- Chatbot returns default/demo responses
- "Running in demo mode" message in console
- No real AI-generated content

**Solutions:**
```bash
# Check if API key is loaded
cd server
node -e "
require('dotenv').config();
console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET');
console.log('Model:', process.env.OPENROUTER_MODEL);
console.log('Base URL:', process.env.OPENROUTER_BASE_URL);
"
```

### **2. Authentication Errors (401)**

**Symptoms:**
- "Authentication failed" in logs
- 401 status errors

**Solutions:**
1. **Verify API Key**: Check if your OpenRouter API key is valid
2. **Check Credits**: Ensure your OpenRouter account has credits/usage available
3. **Test API Key**: 
   ```bash
   cd server && node test-api.js
   ```

### **3. Model Not Found (400/404)**

**Symptoms:**
- "Model not found" errors
- Invalid model name errors

**Current Model**: `openai/gpt-oss-20b:free`

**Alternative Free Models:**
```env
# Try these if current model doesn't work:
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
OPENROUTER_MODEL=microsoft/wizardlm-2-8x22b:free
OPENROUTER_MODEL=google/gemma-7b-it:free
```

### **4. Rate Limiting (429)**

**Symptoms:**
- "Rate limit exceeded" errors
- Temporary API unavailability

**Solutions:**
- Wait and retry (free tier has limits)
- Consider upgrading OpenRouter plan
- Implement request queuing in your app

## 🔍 **Debugging Steps**

### **Step 1: Environment Check**
```bash
cd server
cat .env | grep OPENROUTER
```

### **Step 2: API Test**
```bash
cd server
node test-api.js
```

### **Step 3: Server Logs**
```bash
cd server
npm start
# Look for OpenRouter configuration logs
```

### **Step 4: Manual Test**
Test the chatbot endpoint directly:
```bash
# First, get a project ID and auth token from your app
curl -X POST http://localhost:5000/api/chatbot/chat/YOUR_PROJECT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Hello, test message"}'
```

## ⚙️ **Configuration Files**

### **Environment Variables** (`server/.env`):
```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-oss-20b:free
OPENROUTER_APP_NAME=LCA_TOOL
OPENROUTER_SITE_URL=http://localhost:3000
```

### **Service Configuration** (`server/services/openaiService.js`):
- ✅ Proper dotenv loading
- ✅ Environment variable validation
- ✅ Fallback to demo mode
- ✅ Enhanced error logging

## 🔧 **Quick Fixes**

### **Fix 1: Restart Server**
```bash
# Stop server (Ctrl+C)
cd server
npm start
```

### **Fix 2: Clear Node Cache**
```bash
cd server
rm -rf node_modules
npm install
npm start
```

### **Fix 3: Verify API Key**
1. Go to [OpenRouter Keys](https://openrouter.ai/keys)
2. Check if your key is active
3. Verify you have credits/usage available

### **Fix 4: Update Model**
Try different free models in your `.env` file:
```env
OPENROUTER_MODEL=openai/gpt-oss-20b:free
# OR
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

## 🚀 **Production Deployment**

For Render deployment, add these environment variables:
```
OPENROUTER_API_KEY=your_production_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-oss-20b:free
OPENROUTER_APP_NAME=LCA_TOOL
OPENROUTER_SITE_URL=https://your-app-url.onrender.com
```

## 📞 **Support**

If issues persist:
1. Check OpenRouter status page
2. Verify account limits and usage
3. Test with a simple curl request
4. Check server logs for detailed error messages

## 🔄 **Last Updated**
Model configuration updated to use `openai/gpt-oss-20b:free` as requested.