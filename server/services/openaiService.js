import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class OpenAIService {
  constructor() {
    // Check if we have OpenRouter configuration
    const hasOpenRouterConfig = process.env.OPENROUTER_API_KEY && 
                                process.env.OPENROUTER_BASE_URL && 
                                process.env.OPENROUTER_MODEL;
    
    if (hasOpenRouterConfig) {
      // Configure for OpenRouter
      this.openai = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: process.env.OPENROUTER_BASE_URL,
        defaultHeaders: {
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_APP_NAME || "LCA_TOOL"
        }
      });
      this.model = process.env.OPENROUTER_MODEL;
      this.isDemoMode = false;
      console.log('OpenRouter API configured with model:', this.model);
    } else {
      // Fallback to demo mode
      this.openai = new OpenAI({
        apiKey: 'demo-key'
      });
      this.model = 'gpt-4o-mini';
      this.isDemoMode = true;
      console.log('Running in demo mode - no valid API configuration found');
    }
  }

  async generateChatResponse(message, reportData, conversationHistory = []) {
    if (this.isDemoMode) {
      return this.getDemoResponse(message, reportData);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(reportData);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message }
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      return this.getFallbackResponse(message, reportData);
    }
  }

  buildSystemPrompt(reportData) {
    return `You are an AI expert in Life Cycle Assessment (LCA) and sustainability analysis. You have access to detailed report data for the project "${reportData.project.projectName}".

REPORT DATA CONTEXT:
- Project: ${reportData.project.projectName}
- Metal Type: ${reportData.project.metalType}
- Production Route: ${reportData.project.productionRoute}
- Region: ${reportData.project.region}
- Sustainability Score: ${reportData.scores.sustainability}%
- Circular Economy Score: ${reportData.scores.circular}%
- Linear Economy Score: ${reportData.scores.linear}%

STAGE DETAILS:
${reportData.stageMetrics.map(stage => 
  `Stage ${stage.stageNumber} (${stage.stageName}):
  - Material: ${stage.materialType}
  - Energy: Linear ${stage.linear.energyUsage.toFixed(2)} GJ → Circular ${stage.circular.energyUsage.toFixed(2)} GJ (${stage.improvement.energySaving}% saving)
  - Water: Linear ${stage.linear.waterUsage.toFixed(2)} m³ → Circular ${stage.circular.waterUsage.toFixed(2)} m³ (${stage.improvement.waterSaving}% saving)
  - Waste: Linear ${stage.linear.wasteGenerated.toFixed(2)} kg → Circular ${stage.circular.wasteGenerated.toFixed(2)} kg (${stage.improvement.wasteSaving}% saving)
  - CO2: Linear ${stage.linear.co2Emissions.toFixed(2)} kg → Circular ${stage.circular.co2Emissions.toFixed(2)} kg (${stage.improvement.co2Saving}% saving)`
).join('\n\n')}

TOTALS COMPARISON:
- Energy: ${reportData.totals.linear.energy.toFixed(2)} GJ → ${reportData.totals.circular.energy.toFixed(2)} GJ
- Water: ${reportData.totals.linear.water.toFixed(2)} m³ → ${reportData.totals.circular.water.toFixed(2)} m³
- Waste: ${reportData.totals.linear.waste.toFixed(2)} kg → ${reportData.totals.circular.waste.toFixed(2)} kg
- CO2: ${reportData.totals.linear.co2.toFixed(2)} kg → ${reportData.totals.circular.co2.toFixed(2)} kg

CURRENT AI INSIGHTS:
${reportData.aiInsights.map((insight, i) => `${i+1}. ${insight}`).join('\n')}

Your role is to:
1. Answer specific questions about the LCA data
2. Provide detailed explanations of sustainability metrics
3. Suggest actionable improvements based on the data
4. Compare linear vs circular economy impacts
5. Explain the environmental implications of different stages
6. Provide industry context and benchmarking
7. Help users understand complex LCA concepts

Be conversational, insightful, and focus on actionable recommendations. Use the data provided to give specific, quantified answers. If asked about data not in the report, clearly state that and suggest how such data could be obtained.`;
  }

  getDemoResponse(message, reportData) {
    const lowerMessage = message.toLowerCase();
    
    // Pattern matching for common questions
    if (lowerMessage.includes('energy') || lowerMessage.includes('power')) {
      const energySavings = ((reportData.totals.linear.energy - reportData.totals.circular.energy) / reportData.totals.linear.energy * 100).toFixed(1);
      return `Looking at your energy consumption data, your project could achieve **${energySavings}% energy savings** by implementing circular economy principles. 

The highest energy-consuming stage is **${reportData.stageMetrics.reduce((max, stage) => stage.linear.energyUsage > max.linear.energyUsage ? stage : max).stageName}** with ${reportData.stageMetrics.reduce((max, stage) => stage.linear.energyUsage > max.linear.energyUsage ? stage : max).linear.energyUsage.toFixed(2)} GJ.

**Recommendations:**
- Switch to renewable energy sources in high-consumption stages
- Implement energy recovery systems
- Optimize process parameters to reduce energy intensity`;
    }

    if (lowerMessage.includes('water') || lowerMessage.includes('consumption')) {
      const waterSavings = ((reportData.totals.linear.water - reportData.totals.circular.water) / reportData.totals.linear.water * 100).toFixed(1);
      return `Your water usage analysis shows potential for **${waterSavings}% water savings** through circular practices.

**Key Insights:**
- Total linear water usage: ${reportData.totals.linear.water.toFixed(2)} m³
- Potential circular usage: ${reportData.totals.circular.water.toFixed(2)} m³
- Highest water-consuming stage: **${reportData.stageMetrics.reduce((max, stage) => stage.linear.waterUsage > max.linear.waterUsage ? stage : max).stageName}**

**Recommendations:**
- Implement closed-loop water recycling
- Install water treatment and reuse systems
- Monitor water quality to optimize recycling efficiency`;
    }

    if (lowerMessage.includes('waste') || lowerMessage.includes('recycling')) {
      const wasteSavings = ((reportData.totals.linear.waste - reportData.totals.circular.waste) / reportData.totals.linear.waste * 100).toFixed(1);
      return `Your waste analysis reveals excellent potential for **${wasteSavings}% waste reduction** through circular economy implementation.

**Waste Breakdown:**
- Linear approach generates: ${reportData.totals.linear.waste.toFixed(2)} kg waste
- Circular approach reduces to: ${reportData.totals.circular.waste.toFixed(2)} kg waste

**Top Recommendations:**
1. Implement design-for-disassembly principles
2. Establish material recovery facilities
3. Create partnerships with recycling companies
4. Use recycled content in new products`;
    }

    if (lowerMessage.includes('co2') || lowerMessage.includes('carbon') || lowerMessage.includes('emission')) {
      const co2Savings = ((reportData.totals.linear.co2 - reportData.totals.circular.co2) / reportData.totals.linear.co2 * 100).toFixed(1);
      return `Your carbon footprint analysis shows **${co2Savings}% CO2 reduction potential** through circular practices.

**Carbon Impact:**
- Linear emissions: ${reportData.totals.linear.co2.toFixed(2)} kg CO2
- Circular emissions: ${reportData.totals.circular.co2.toFixed(2)} kg CO2
- Total reduction: ${(reportData.totals.linear.co2 - reportData.totals.circular.co2).toFixed(2)} kg CO2

**Impact Equivalents:**
- Equivalent to planting ${Math.round((reportData.totals.linear.co2 - reportData.totals.circular.co2) / 21.77)} trees
- Same as removing a car from the road for ${Math.round((reportData.totals.linear.co2 - reportData.totals.circular.co2) / 2300)} miles

**Carbon Reduction Strategies:**
1. Renewable energy adoption
2. Process optimization
3. Local sourcing to reduce transport emissions
4. Carbon capture and utilization technologies`;
    }

    if (lowerMessage.includes('stage') || lowerMessage.includes('process')) {
      const worstStage = reportData.stageMetrics.reduce((max, stage) => 
        (stage.linear.energyUsage + stage.linear.waterUsage + stage.linear.co2Emissions) > 
        (max.linear.energyUsage + max.linear.waterUsage + max.linear.co2Emissions) ? stage : max
      );
      
      return `Looking at your stage-wise analysis, **${worstStage.stageName}** has the highest environmental impact:

**Stage Impact Details:**
- Energy: ${worstStage.linear.energyUsage.toFixed(2)} GJ (${worstStage.improvement.energySaving}% savings potential)
- Water: ${worstStage.linear.waterUsage.toFixed(2)} m³ (${worstStage.improvement.waterSaving}% savings potential)
- CO2: ${worstStage.linear.co2Emissions.toFixed(2)} kg (${worstStage.improvement.co2Saving}% savings potential)

**Stage-Specific Recommendations:**
1. Focus optimization efforts on this high-impact stage
2. Implement stage-specific circular strategies
3. Consider alternative materials or processes
4. Benchmark against industry best practices`;
    }

    if (lowerMessage.includes('score') || lowerMessage.includes('sustainability')) {
      const scoreCategory = reportData.scores.sustainability >= 80 ? 'Excellent' : 
                           reportData.scores.sustainability >= 60 ? 'Good' : 'Needs Improvement';
      
      return `Your sustainability performance shows **${scoreCategory}** results:

**Score Breakdown:**
- 🌱 Overall Sustainability: **${reportData.scores.sustainability}%**
- ♻️ Circular Economy: **${reportData.scores.circular}%**
- 📊 Linear Economy: **${reportData.scores.linear}%**

**Performance Analysis:**
${reportData.scores.circular > reportData.scores.linear ? 
  `✅ Great news! Your circular score (${reportData.scores.circular}%) exceeds linear (${reportData.scores.linear}%), showing strong sustainability adoption.` :
  `⚠️ Your linear score (${reportData.scores.linear}%) is higher than circular (${reportData.scores.circular}%). This indicates significant room for circular economy improvements.`}

**Improvement Roadmap:**
1. Target the highest-impact stages first
2. Implement circular design principles
3. Establish material recovery systems
4. Monitor and track progress regularly`;
    }

    // Default response for general questions
    return `I'm analyzing your LCA report for **${reportData.project.projectName}**. Here are the key highlights:

**Project Overview:**
- Metal Type: ${reportData.project.metalType}
- Production Route: ${reportData.project.productionRoute}
- Sustainability Score: ${reportData.scores.sustainability}%

**Key Opportunities:**
1. **Energy**: ${((reportData.totals.linear.energy - reportData.totals.circular.energy) / reportData.totals.linear.energy * 100).toFixed(1)}% reduction potential
2. **Water**: ${((reportData.totals.linear.water - reportData.totals.circular.water) / reportData.totals.linear.water * 100).toFixed(1)}% savings possible
3. **Waste**: ${((reportData.totals.linear.waste - reportData.totals.circular.waste) / reportData.totals.linear.waste * 100).toFixed(1)}% reduction achievable

Ask me specific questions about:
- Energy consumption and optimization
- Water usage and recycling opportunities
- Waste reduction strategies
- Carbon footprint analysis
- Stage-wise performance
- Circular economy implementation`;
  }

  getFallbackResponse(message, reportData) {
    return `I apologize, but I'm experiencing technical difficulties connecting to the AI service. However, I can provide you with key insights from your report:

**${reportData.project.projectName} Summary:**
- Sustainability Score: ${reportData.scores.sustainability}%
- Circular Potential: ${reportData.scores.circular}%
- Total Energy Impact: ${reportData.totals.linear.energy.toFixed(2)} GJ (Linear) vs ${reportData.totals.circular.energy.toFixed(2)} GJ (Circular)

**Key Recommendations:**
${reportData.aiInsights.slice(0, 3).map((insight, i) => `${i+1}. ${insight}`).join('\n')}

Please try asking your question again, or contact support if the issue persists.`;
  }

  async generateInsightSummary(reportData) {
    if (this.isDemoMode) {
      return this.getDemoInsightSummary(reportData);
    }

    try {
      const prompt = `Generate a comprehensive sustainability insight summary for this LCA project:

Project: ${reportData.project.projectName}
Sustainability Score: ${reportData.scores.sustainability}%
Circular Score: ${reportData.scores.circular}%

Key Metrics:
- Energy: ${reportData.totals.linear.energy.toFixed(2)} GJ → ${reportData.totals.circular.energy.toFixed(2)} GJ
- Water: ${reportData.totals.linear.water.toFixed(2)} m³ → ${reportData.totals.circular.water.toFixed(2)} m³
- Waste: ${reportData.totals.linear.waste.toFixed(2)} kg → ${reportData.totals.circular.waste.toFixed(2)} kg

Provide:
1. Overall performance assessment
2. Top 3 improvement opportunities
3. Environmental impact significance
4. Industry benchmarking context

Keep it concise and actionable.`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.5
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      return this.getDemoInsightSummary(reportData);
    }
  }

  getDemoInsightSummary(reportData) {
    const energySavings = ((reportData.totals.linear.energy - reportData.totals.circular.energy) / reportData.totals.linear.energy * 100).toFixed(1);
    const scoreCategory = reportData.scores.sustainability >= 80 ? 'excellent' : 
                         reportData.scores.sustainability >= 60 ? 'good' : 'developing';

    return `**Performance Assessment**: Your project shows ${scoreCategory} sustainability performance with a ${reportData.scores.sustainability}% overall score.

**Top Improvement Opportunities:**
1. **Energy Optimization**: ${energySavings}% reduction potential through circular practices
2. **Material Recovery**: Boost recycling rates to improve circular economy score
3. **Process Efficiency**: Focus on highest-impact stages for maximum environmental benefit

**Environmental Significance**: Implementing these improvements could reduce your carbon footprint by ${Math.round((reportData.totals.linear.co2 - reportData.totals.circular.co2))} kg CO2, equivalent to planting ${Math.round((reportData.totals.linear.co2 - reportData.totals.circular.co2) / 21.77)} trees.

**Industry Context**: Your circular economy score of ${reportData.scores.circular}% ${reportData.scores.circular >= 70 ? 'exceeds' : reportData.scores.circular >= 50 ? 'meets' : 'has room to improve against'} typical industry benchmarks for ${reportData.project.metalType} production.`;
  }
}

export default new OpenAIService();