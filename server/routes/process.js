import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Submit process data
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { projectName, overallData, stages } = req.body;
    
    const projectId = uuidv4();
    
    // Calculate sustainability score based on stages
    let totalEnergy = 0;
    let totalWater = 0;
    let totalWaste = 0;
    
    stages.forEach(stage => {
      totalEnergy += stage.energyUsage || 0;
      totalWater += stage.waterUsage || 0;
      totalWaste += stage.wasteGenerated || 0;
    });

    // Simple sustainability scoring algorithm
    const sustainabilityScore = Math.max(0, 100 - (totalEnergy * 0.5) - (totalWater * 0.3) - (totalWaste * 0.2));
    const circularScore = sustainabilityScore + (overallData.recyclePercentage * 0.3) + (overallData.reusePercentage * 0.2);
    const linearScore = sustainabilityScore - (overallData.landfillPercentage * 0.1);

    const project = new Project({
      projectId,
      userId: req.user._id,
      projectName,
      overallData,
      stages,
      sustainabilityScore: Math.round(sustainabilityScore),
      circularScore: Math.round(circularScore),
      linearScore: Math.round(linearScore),
      status: 'completed'
    });

    await project.save();

    res.status(201).json({
      message: 'Process data submitted successfully',
      project: {
        projectId,
        projectName,
        sustainabilityScore: project.sustainabilityScore,
        circularScore: project.circularScore,
        linearScore: project.linearScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
router.get('/get/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      projectId: req.params.id,
      userId: req.user._id 
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all user projects
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id })
      .sort({ timestamp: -1 });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compare multiple projects
router.post('/compare', authenticateToken, async (req, res) => {
  try {
    const { projectIds } = req.body;
    
    const projects = await Project.find({
      projectId: { $in: projectIds },
      userId: req.user._id
    });

    if (projects.length === 0) {
      return res.status(404).json({ error: 'No projects found' });
    }

    // Calculate comparison metrics
    const comparison = projects.map(project => ({
      projectId: project.projectId,
      projectName: project.projectName,
      sustainabilityScore: project.sustainabilityScore,
      circularScore: project.circularScore,
      linearScore: project.linearScore,
      totalEnergy: project.stages.reduce((sum, stage) => sum + (stage.energyUsage || 0), 0),
      totalWater: project.stages.reduce((sum, stage) => sum + (stage.waterUsage || 0), 0),
      totalWaste: project.stages.reduce((sum, stage) => sum + (stage.wasteGenerated || 0), 0),
      stageCount: project.stages.length
    }));

    res.json({
      projects: comparison,
      summary: {
        avgSustainabilityScore: Math.round(comparison.reduce((sum, p) => sum + p.sustainabilityScore, 0) / comparison.length),
        bestProject: comparison.reduce((best, current) => 
          current.sustainabilityScore > best.sustainabilityScore ? current : best
        ),
        worstProject: comparison.reduce((worst, current) => 
          current.sustainabilityScore < worst.sustainabilityScore ? current : worst
        )
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;