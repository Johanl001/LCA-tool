import express from 'express';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';
import openaiService from '../services/openaiService.js';

const router = express.Router();

// Chat with AI about a specific project report
router.post('/chat/:projectId', authenticateToken, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get project data
    const project = await Project.findOne({ 
      projectId: req.params.projectId,
      userId: req.user._id 
    }).populate('userId', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate report data for context
    const reportData = await generateReportData(project);

    // Get AI response
    const aiResponse = await openaiService.generateChatResponse(
      message, 
      reportData, 
      conversationHistory
    );

    // Log the conversation for analytics (optional)
    console.log(`Chat interaction for project ${project.projectName}: ${message.substring(0, 100)}...`);

    res.json({
      response: aiResponse,
      timestamp: new Date(),
      projectId: req.params.projectId,
      projectName: project.projectName
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI response',
      message: 'Please try again or contact support if the issue persists.'
    });
  }
});

// Get AI-generated summary insights for a project
router.get('/insights/:projectId', authenticateToken, async (req, res) => {
  try {
    // Get project data
    const project = await Project.findOne({ 
      projectId: req.params.projectId,
      userId: req.user._id 
    }).populate('userId', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate report data for context
    const reportData = await generateReportData(project);

    // Get AI-generated insights summary
    const insightsSummary = await openaiService.generateInsightSummary(reportData);

    res.json({
      insights: insightsSummary,
      reportData: {
        projectName: reportData.project.projectName,
        sustainabilityScore: reportData.scores.sustainability,
        circularScore: reportData.scores.circular,
        linearScore: reportData.scores.linear,
        totalStages: reportData.stageMetrics.length
      },
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Insights API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights',
      message: 'Please try again or contact support if the issue persists.'
    });
  }
});

// Get suggested questions based on report data
router.get('/suggestions/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      projectId: req.params.projectId,
      userId: req.user._id 
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate contextual question suggestions
    const reportData = await generateReportData(project);
    const suggestions = generateQuestionSuggestions(reportData);

    res.json({
      suggestions,
      projectId: req.params.projectId,
      projectName: project.projectName
    });

  } catch (error) {
    console.error('Suggestions API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate suggestions'
    });
  }
});

// Helper function to generate report data (reused from reports.js)
async function generateReportData(project) {
  // Calculate stage-wise metrics
  const stageMetrics = project.stages.map((stage, index) => {
    const linearMetrics = {
      energyUsage: stage.energyUsage,
      waterUsage: stage.waterUsage,
      wasteGenerated: stage.wasteGenerated || (stage.energyUsage * 0.1),
      co2Emissions: stage.co2Emissions || (stage.energyUsage * 2.5)
    };

    const circularMetrics = {
      energyUsage: linearMetrics.energyUsage * (1 - stage.recyclingPercentage / 100 * 0.3),
      waterUsage: linearMetrics.waterUsage * (1 - stage.recyclingPercentage / 100 * 0.25),
      wasteGenerated: linearMetrics.wasteGenerated * (1 - stage.recyclingPercentage / 100 * 0.8),
      co2Emissions: linearMetrics.co2Emissions * (1 - stage.recyclingPercentage / 100 * 0.4)
    };

    return {
      stageNumber: index + 1,
      stageName: stage.stageName,
      materialType: stage.materialType,
      linear: linearMetrics,
      circular: circularMetrics,
      improvement: {
        energySaving: Math.round((linearMetrics.energyUsage - circularMetrics.energyUsage) / linearMetrics.energyUsage * 100),
        waterSaving: Math.round((linearMetrics.waterUsage - circularMetrics.waterUsage) / linearMetrics.waterUsage * 100),
        wasteSaving: Math.round((linearMetrics.wasteGenerated - circularMetrics.wasteGenerated) / linearMetrics.wasteGenerated * 100),
        co2Saving: Math.round((linearMetrics.co2Emissions - circularMetrics.co2Emissions) / linearMetrics.co2Emissions * 100)
      }
    };
  });

  // Calculate totals
  const totals = {
    linear: {
      energy: stageMetrics.reduce((sum, stage) => sum + stage.linear.energyUsage, 0),
      water: stageMetrics.reduce((sum, stage) => sum + stage.linear.waterUsage, 0),
      waste: stageMetrics.reduce((sum, stage) => sum + stage.linear.wasteGenerated, 0),
      co2: stageMetrics.reduce((sum, stage) => sum + stage.linear.co2Emissions, 0)
    },
    circular: {
      energy: stageMetrics.reduce((sum, stage) => sum + stage.circular.energyUsage, 0),
      water: stageMetrics.reduce((sum, stage) => sum + stage.circular.waterUsage, 0),
      waste: stageMetrics.reduce((sum, stage) => sum + stage.circular.wasteGenerated, 0),
      co2: stageMetrics.reduce((sum, stage) => sum + stage.circular.co2Emissions, 0)
    }
  };

  // AI-generated insights (static placeholders)
  const aiInsights = [
    `Stage ${stageMetrics.reduce((max, stage, i) => stage.linear.energyUsage > stageMetrics[max].linear.energyUsage ? i : max, 0) + 1} has the highest energy impact. Consider renewable energy sources to reduce impact by 40%.`,
    `Implementing circular economy principles could reduce total waste by ${Math.round((totals.linear.waste - totals.circular.waste) / totals.linear.waste * 100)}%.`,
    `Transport optimization in Stage ${stageMetrics.findIndex(s => s.stageName.toLowerCase().includes('transport')) + 1 || 'N/A'} could reduce CO2 emissions by 25% using rail instead of road transport.`,
    `Material substitution in ${project.overallData.metalType} processing could improve recycling efficiency by 15%.`
  ];

  return {
    project: {
      projectId: project.projectId,
      projectName: project.projectName,
      metalType: project.overallData.metalType,
      productionRoute: project.overallData.productionRoute,
      region: project.overallData.region,
      timestamp: project.timestamp,
      user: project.userId.name
    },
    scores: {
      sustainability: project.sustainabilityScore,
      circular: project.circularScore,
      linear: project.linearScore
    },
    stageMetrics,
    totals,
    aiInsights,
    metadata: {
      generatedAt: new Date(),
      reportVersion: '1.0',
      scenarioType: 'Linear vs Circular Comparison'
    }
  };
}

// Helper function to generate contextual question suggestions
function generateQuestionSuggestions(reportData) {
  const suggestions = [
    "What are the main environmental impacts of my project?",
    "How can I improve my sustainability score?",
    "Which stage has the highest energy consumption?",
    "What are the benefits of circular economy for my project?",
    "How much CO2 can I save by implementing circular practices?",
    "What specific actions should I take to reduce water usage?",
    "How does my project compare to industry benchmarks?",
    "What are the cost implications of the recommended improvements?"
  ];

  // Add dynamic suggestions based on data
  const highestEnergyStage = reportData.stageMetrics.reduce((max, stage) => 
    stage.linear.energyUsage > max.linear.energyUsage ? stage : max
  );

  const circularAdvantage = reportData.scores.circular - reportData.scores.linear;

  if (highestEnergyStage) {
    suggestions.push(`Why does ${highestEnergyStage.stageName} consume so much energy?`);
    suggestions.push(`How can I optimize the ${highestEnergyStage.stageName} stage?`);
  }

  if (circularAdvantage > 20) {
    suggestions.push("My circular score is much higher than linear - what does this mean?");
  } else if (circularAdvantage < -10) {
    suggestions.push("My linear score is higher than circular - how can I improve this?");
  }

  if (reportData.scores.sustainability < 60) {
    suggestions.push("My sustainability score is below 60% - what are the priority actions?");
  }

  // Randomize and return top 8 suggestions
  return suggestions.sort(() => 0.5 - Math.random()).slice(0, 8);
}

export default router;