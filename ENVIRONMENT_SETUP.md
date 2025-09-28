# 🔐 Environment Variables Setup Guide

## 📁 **Local Development Setup**

Your `.env` file has been created at `server/.env` and is **automatically protected** from Git commits.

### **🔑 Add Your API Key:**

1. **Open** `server/.env` file
2. **Replace** `your_new_openrouter_api_key_here` with your actual NEW API key
3. **Save** the file

```env
# Replace this line in server/.env:
OPENROUTER_API_KEY=your_new_openrouter_api_key_here

# With your actual key:
OPENROUTER_API_KEY=sk-or-v1-your-actual-new-key-here
```

### **🛡️ Security Protections in Place:**

✅ **`.env` is in `.gitignore`** - Won't be committed  
✅ **`server/.env` is explicitly ignored**  
✅ **All `*.key`, `*.secret` files blocked**  
✅ **`api.txt` and similar files prevented**  

### **🚀 For Production Deployment:**

**Never** put production keys in files. Use Render's environment variables:

```
OPENROUTER_API_KEY=your_production_key
MONGODB_URI=mongodb+srv://your-atlas-connection
JWT_SECRET=your_super_secure_64_character_secret
```

### **🔧 Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **✅ Verification:**

Run this to confirm your `.env` is ignored:
```bash
git status
# Should NOT show server/.env in changes
```

## 🚨 **Security Reminders:**

- 🚫 **NEVER** commit `.env` files
- 🔄 **Always** use environment variables in production  
- 🔑 **Rotate** API keys if ever exposed
- 📋 **Use** `.env.example` for templates only