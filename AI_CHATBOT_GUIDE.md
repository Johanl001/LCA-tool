# AI Chatbot Integration Guide

## Overview

The AI Chatbot provides intelligent insights and detailed analysis of your LCA (Life Cycle Assessment) reports. It can answer specific questions about your sustainability data, provide actionable recommendations, and help you understand complex environmental metrics.

## Features

### 🤖 Intelligent Analysis
- Real-time analysis of your LCA report data
- Contextual responses based on your specific project metrics
- Industry benchmarking and comparison insights

### 💬 Interactive Chat Interface
- Natural language conversations about your sustainability data
- Persistent chat history during session
- Quick suggestion buttons for common questions

### 📊 Data-Driven Insights
- Energy consumption optimization recommendations
- Water usage reduction strategies
- Waste minimization approaches
- Carbon footprint analysis
- Circular economy implementation guidance

### 🎯 Personalized Recommendations
- Stage-specific improvement suggestions
- Prioritized action items based on impact
- Cost-benefit analysis insights
- Implementation timelines and strategies

## How to Use

### 1. Generate a Report
First, navigate to the Reports section and generate a comprehensive LCA report for your project.

### 2. Open AI Assistant
Click the **"AI Assistant"** button in the export options or the **"Ask AI"** button in the AI Insights section.

### 3. Start Asking Questions
The chatbot will provide suggested questions to get you started, or you can ask your own questions such as:

- "What are the main environmental impacts of my project?"
- "How can I improve my sustainability score?"
- "Which stage has the highest energy consumption?"
- "What are the benefits of circular economy for my project?"
- "How much CO2 can I save by implementing circular practices?"

### 4. Get Detailed Insights
The AI will analyze your specific report data and provide:
- Quantified impact assessments
- Specific improvement recommendations
- Industry context and benchmarking
- Implementation strategies

## Sample Questions

### Energy Optimization
- "How can I reduce energy consumption in my highest-impact stage?"
- "What renewable energy options would work best for my project?"
- "What's the potential energy savings from circular practices?"

### Water Management
- "Where can I implement water recycling systems?"
- "What's my water footprint compared to industry standards?"
- "How can I reduce water usage in production stages?"

### Waste Reduction
- "What circular design principles should I implement?"
- "How can I increase my recycling percentage?"
- "What's the waste reduction potential of my project?"

### Carbon Footprint
- "What are my main sources of CO2 emissions?"
- "How can I achieve carbon neutrality?"
- "What transport optimizations would reduce my carbon footprint?"

### Sustainability Scoring
- "Why is my sustainability score X%?"
- "What specific actions will improve my score most?"
- "How do I compare to industry benchmarks?"

## Configuration

### OpenAI Integration (Optional)
The chatbot works in two modes:

1. **Demo Mode** (Default): Provides intelligent responses using pattern matching and your project data
2. **AI-Powered Mode**: Uses OpenAI's GPT models for advanced natural language understanding

To enable AI-Powered mode:

1. Get an OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Copy `server/.env.example` to `server/.env`
3. Add your API key: `OPENAI_API_KEY=your-api-key-here`
4. Restart the server

### Environment Variables
```env
# Required
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lca_database
JWT_SECRET=your-secure-jwt-secret

# Optional - for enhanced AI responses
OPENAI_API_KEY=your-openai-api-key-here
```

## Technical Details

### Architecture
- **Frontend**: React component with TypeScript
- **Backend**: Express.js API endpoints
- **AI Service**: OpenAI GPT-4 integration with fallback responses
- **Context**: Full report data provided to AI for accurate responses

### API Endpoints
- `POST /api/chatbot/chat/:projectId` - Send message and get AI response
- `GET /api/chatbot/insights/:projectId` - Get AI-generated summary insights
- `GET /api/chatbot/suggestions/:projectId` - Get contextual question suggestions

### Security
- JWT token authentication required
- User can only access their own project data
- API rate limiting implemented
- No sensitive data stored in chat logs

## Troubleshooting

### Common Issues

**Chatbot not responding:**
- Check your internet connection
- Verify the backend server is running
- Ensure you have a valid authentication token

**"Demo mode" responses:**
- This means OpenAI API key is not configured
- Demo mode still provides intelligent insights based on your data
- To enable full AI features, add your OpenAI API key to the environment

**Error messages:**
- Check the browser console for detailed error information
- Verify your project has generated report data
- Ensure MongoDB is running and accessible

### Getting Help
1. Check the browser developer console for error messages
2. Verify all dependencies are installed: `npm install`
3. Ensure environment variables are configured properly
4. Check server logs for backend issues

## Benefits

### For Sustainability Professionals
- **Time Savings**: Instantly understand complex LCA data
- **Expert Insights**: AI-powered recommendations based on industry best practices
- **Decision Support**: Data-driven guidance for sustainability initiatives

### For Environmental Analysts
- **Deep Analysis**: Granular insights into environmental impacts
- **Trend Identification**: Spot patterns and optimization opportunities
- **Benchmarking**: Compare performance against industry standards

### For Technology Developers
- **Integration Ready**: Easy to extend and customize
- **Scalable**: Supports multiple projects and users
- **Modern Stack**: Built with React, TypeScript, and Node.js

## Future Enhancements

- Voice interaction capabilities
- Integration with external databases and APIs
- Custom AI training on industry-specific data
- Multi-language support
- Advanced visualization generation
- Automated report generation based on conversations

---

The AI Chatbot transforms complex LCA data into actionable insights, making sustainability analysis accessible and practical for professionals across all industries.