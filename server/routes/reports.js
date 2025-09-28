import express from 'express';
import express from 'express';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate report data
router.get('/generate/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      projectId: req.params.projectId,
      userId: req.user._id 
    }).populate('userId', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

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

    const reportData = {
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

    res.json(reportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;