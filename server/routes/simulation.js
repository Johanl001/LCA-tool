import express from 'express';
import Simulation from '../models/Simulation.js';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Run scenario simulation
router.post('/run', authenticateToken, async (req, res) => {
  try {
    const { projectId, scenarioName, scenarioChanges } = req.body;

    // Get original project
    const project = await Project.findOne({ 
      projectId,
      userId: req.user._id 
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate predicted scores based on scenario changes
    let energyReduction = 0;
    let waterReduction = 0;
    let co2Reduction = 0;

    // Simple simulation logic
    if (scenarioChanges.energySource === 'renewable') {
      energyReduction = 30; // 30% reduction
      co2Reduction += 40; // 40% CO2 reduction
    }

    if (scenarioChanges.recyclingRate > 50) {
      energyReduction += 15;
      waterReduction += 20;
      co2Reduction += 25;
    }

    if (scenarioChanges.efficiency > 90) {
      energyReduction += 10;
      waterReduction += 8;
    }

    if (scenarioChanges.transportMode === 'rail' || scenarioChanges.transportMode === 'ship') {
      co2Reduction += 20;
      energyReduction += 5;
    }

    // Calculate new sustainability score
    const baseScore = project.sustainabilityScore;
    const sustainabilityScore = Math.min(100, baseScore + (energyReduction * 0.4) + (waterReduction * 0.3) + (co2Reduction * 0.3));

    const simulation = new Simulation({
      projectId,
      scenarioName,
      scenarioChanges,
      predictedScores: {
        sustainabilityScore: Math.round(sustainabilityScore),
        energyReduction: Math.round(energyReduction),
        waterReduction: Math.round(waterReduction),
        co2Reduction: Math.round(co2Reduction)
      }
    });

    await simulation.save();

    res.json({
      message: 'Simulation completed successfully',
      originalScore: baseScore,
      predictedScore: Math.round(sustainabilityScore),
      improvements: {
        energyReduction: Math.round(energyReduction),
        waterReduction: Math.round(waterReduction),
        co2Reduction: Math.round(co2Reduction)
      },
      scenarioChanges
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get simulation history
router.get('/history/:projectId', authenticateToken, async (req, res) => {
  try {
    const simulations = await Simulation.find({ 
      projectId: req.params.projectId 
    }).sort({ timestamp: -1 });

    res.json(simulations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;