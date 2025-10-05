import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';
import { seedSampleData } from '../utils/seedData.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import lcaOptimizationService from '../services/optimizationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced ML prediction function
const generateMLPredictions = async (projectData) => {
  return new Promise((resolve, reject) => {
    try {
      const pythonScriptPath = path.join(__dirname, '../../ml_models/predict.py');
      
      // Prepare input data for ML model
      const mlInput = {
        metal_type: projectData.overallData.metalType || 'Aluminum',
        production_route: projectData.overallData.productionRoute || 'Primary',
        region: projectData.overallData.region || 'Asia',
        total_energy: projectData.totalEnergy || 0,
        total_water: projectData.totalWater || 0,
        recycling_rate: projectData.overallData.recyclePercentage || 0,
        process_efficiency: projectData.stages.reduce((avg, stage) => avg + (stage.efficiency || 85), 0) / projectData.stages.length,
        transport_distance: projectData.stages.reduce((avg, stage) => avg + (stage.transportDistance || 0), 0) / projectData.stages.length,
        stage_count: projectData.stages.length
      };
      
      console.log('Calling ML model with input:', mlInput);
      
      const pythonProcess = spawn('python', [pythonScriptPath, JSON.stringify(mlInput)], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let outputData = '';
      let errorData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python script error:', errorData);
          // Return fallback predictions
          resolve({
            sustainability_score: Math.max(0, 100 - (mlInput.total_energy * 2) - (mlInput.total_water * 1.5)),
            circular_score: Math.max(0, 70 + (mlInput.recycling_rate * 0.5)),
            linear_score: Math.max(0, 60 - (mlInput.recycling_rate * 0.3)),
            confidence: 0.6,
            source: 'fallback'
          });
          return;
        }
        
        try {
          const result = JSON.parse(outputData.trim());
          if (result.error) {
            console.error('ML model error:', result.error);
            // Return fallback predictions
            resolve({
              sustainability_score: Math.max(0, 100 - (mlInput.total_energy * 2) - (mlInput.total_water * 1.5)),
              circular_score: Math.max(0, 70 + (mlInput.recycling_rate * 0.5)),
              linear_score: Math.max(0, 60 - (mlInput.recycling_rate * 0.3)),
              confidence: 0.6,
              source: 'fallback'
            });
          } else {
            console.log('ML predictions received:', result);
            resolve({
              ...result.predictions,
              confidence: result.model_info?.confidence || 0.8,
              source: 'ml_model'
            });
          }
        } catch (parseError) {
          console.error('Failed to parse ML output:', parseError);
          // Return fallback predictions
          resolve({
            sustainability_score: Math.max(0, 100 - (mlInput.total_energy * 2) - (mlInput.total_water * 1.5)),
            circular_score: Math.max(0, 70 + (mlInput.recycling_rate * 0.5)),
            linear_score: Math.max(0, 60 - (mlInput.recycling_rate * 0.3)),
            confidence: 0.6,
            source: 'fallback'
          });
        }
      });
      
      // Set timeout for ML prediction
      setTimeout(() => {
        pythonProcess.kill();
        console.log('ML prediction timeout, using fallback');
        resolve({
          sustainability_score: Math.max(0, 100 - (mlInput.total_energy * 2) - (mlInput.total_water * 1.5)),
          circular_score: Math.max(0, 70 + (mlInput.recycling_rate * 0.5)),
          linear_score: Math.max(0, 60 - (mlInput.recycling_rate * 0.3)),
          confidence: 0.5,
          source: 'fallback_timeout'
        });
      }, 10000); // 10 second timeout
      
    } catch (error) {
      console.error('Error in ML prediction:', error);
      resolve({
        sustainability_score: 65,
        circular_score: 75,
        linear_score: 55,
        confidence: 0.5,
        source: 'fallback_error'
      });
    }
  });
};

const router = express.Router();

// Submit process data
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: 'Request body must be a valid JSON object'
      });
    }

    const { projectName, overallData, stages } = req.body;
    
    // Validate required fields
    if (!projectName || typeof projectName !== 'string' || projectName.trim() === '') {
      return res.status(400).json({ 
        error: 'Project name is required',
        details: 'Project name must be a non-empty string'
      });
    }

    if (!overallData || typeof overallData !== 'object') {
      return res.status(400).json({ 
        error: 'Overall data is required',
        details: 'Overall data must be a valid object'
      });
    }

    if (!stages || !Array.isArray(stages) || stages.length === 0) {
      return res.status(400).json({ 
        error: 'Stages data is required',
        details: 'At least one stage must be provided'
      });
    }

    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        details: 'Valid user authentication is required'
      });
    }
    
    const projectId = uuidv4();
    
    // Calculate sustainability score based on stages with error handling
    let totalEnergy = 0;
    let totalWater = 0;
    let totalWaste = 0;
    
    // Validate and process stages
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      if (!stage || typeof stage !== 'object') {
        return res.status(400).json({ 
          error: `Invalid stage data at index ${i}`,
          details: 'Each stage must be a valid object'
        });
      }

      // Validate numeric fields with defaults
      const energyUsage = parseFloat(stage.energyUsage) || 0;
      const waterUsage = parseFloat(stage.waterUsage) || 0;
      const wasteGenerated = parseFloat(stage.wasteGenerated) || 0;

      if (energyUsage < 0 || waterUsage < 0 || wasteGenerated < 0) {
        return res.status(400).json({ 
          error: `Invalid values in stage ${i + 1}`,
          details: 'Energy, water, and waste values must be non-negative'
        });
      }

      totalEnergy += energyUsage;
      totalWater += waterUsage;
      totalWaste += wasteGenerated;
    }

    // Validate overall data numeric fields
    const recyclePercentage = parseFloat(overallData.recyclePercentage) || 0;
    const reusePercentage = parseFloat(overallData.reusePercentage) || 0;
    const landfillPercentage = parseFloat(overallData.landfillPercentage) || 0;

    if (recyclePercentage < 0 || recyclePercentage > 100 ||
        reusePercentage < 0 || reusePercentage > 100 ||
        landfillPercentage < 0 || landfillPercentage > 100) {
      return res.status(400).json({ 
        error: 'Invalid percentage values',
        details: 'All percentage values must be between 0 and 100'
      });
    }

    // Use optimization service for enhanced calculations
    const optimizedCalculations = lcaOptimizationService.calculateSustainabilityScore(stages, overallData);
    console.log('Optimized calculations:', optimizedCalculations);
    
    // Process stages with optimization
    const processedStages = lcaOptimizationService.processStagesOptimized(stages);
    
    // Simple sustainability scoring algorithm with bounds checking (fallback)
    const sustainabilityScore = optimizedCalculations.sustainability || Math.max(0, Math.min(100, 
      100 - (totalEnergy * 0.5) - (totalWater * 0.3) - (totalWaste * 0.2)
    ));
    const circularScore = optimizedCalculations.circular || Math.max(0, Math.min(100,
      sustainabilityScore + (recyclePercentage * 0.3) + (reusePercentage * 0.2)
    ));
    const linearScore = optimizedCalculations.linear || Math.max(0, Math.min(100,
      sustainabilityScore - (landfillPercentage * 0.1)
    ));

    // Generate ML predictions for enhanced accuracy
    let mlPredictions = null;
    try {
      mlPredictions = await generateMLPredictions({
        overallData,
        stages,
        totalEnergy,
        totalWater,
        totalWaste
      });
      console.log('ML predictions generated successfully:', mlPredictions);
    } catch (error) {
      console.error('Failed to generate ML predictions:', error);
    }

    // Use ML predictions if available, otherwise use fallback calculations
    const finalScores = mlPredictions ? {
      sustainabilityScore: Math.round(mlPredictions.sustainability_score || sustainabilityScore),
      circularScore: Math.round(mlPredictions.circular_score || circularScore),
      linearScore: Math.round(mlPredictions.linear_score || linearScore),
      mlConfidence: mlPredictions.confidence,
      predictionSource: mlPredictions.source
    } : {
      sustainabilityScore: Math.round(sustainabilityScore),
      circularScore: Math.round(circularScore),
      linearScore: Math.round(linearScore),
      mlConfidence: null,
      predictionSource: 'mathematical'
    };

    const project = new Project({
      projectId,
      userId: req.user._id,
      projectName: projectName.trim(),
      overallData,
      stages: processedStages, // Use optimized stages
      sustainabilityScore: finalScores.sustainabilityScore,
      circularScore: finalScores.circularScore,
      linearScore: finalScores.linearScore,
      mlConfidence: finalScores.mlConfidence,
      predictionSource: finalScores.predictionSource,
      optimizationGains: optimizedCalculations.optimizationGains,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedProject = await project.save();

    // Log successful creation
    console.log(`Project created successfully: ${projectId} for user ${req.user._id}`);

    res.status(201).json({
      message: 'Process data submitted successfully',
      project: {
        projectId,
        projectName: savedProject.projectName,
        sustainabilityScore: savedProject.sustainabilityScore,
        circularScore: savedProject.circularScore,
        linearScore: savedProject.linearScore,
        totalEnergy: totalEnergy.toFixed(2),
        totalWater: totalWater.toFixed(2),
        totalWaste: totalWaste.toFixed(2),
        mlConfidence: savedProject.mlConfidence,
        predictionSource: savedProject.predictionSource,
        createdAt: savedProject.createdAt
      }
    });
  } catch (error) {
    console.error('Error in /submit endpoint:', error);
    
    // Check for specific database errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Data validation failed',
        details: error.message,
        validationErrors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        error: 'Database operation failed',
        details: 'Please try again later'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

// Get single project
router.get('/get/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Validate project ID
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid project ID',
        details: 'Project ID must be a non-empty string'
      });
    }

    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        details: 'Valid user authentication is required'
      });
    }
    
    const project = await Project.findOne({ 
      projectId: projectId.trim(),
      userId: req.user._id 
    });
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        details: 'The requested project does not exist or you do not have access to it'
      });
    }

    // Log successful retrieval
    console.log(`Project retrieved successfully: ${projectId} for user ${req.user._id}`);

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Error in /get/:id endpoint:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid project ID format',
        details: 'The provided project ID is not in the correct format'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Failed to retrieve project'
    });
  }
});

// Get all user projects
router.get('/all', async (req, res) => {
  try {
    // Check if user is authenticated
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No auth token provided, returning empty projects array');
      return res.json([]);
    }

    // Try to authenticate
    try {
      const jwt = await import('jsonwebtoken');
      const User = (await import('../models/User.js')).default;
      
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.log('Invalid token, returning empty projects array');
        return res.json([]);
      }

      let projects = await Project.find({ userId: user._id })
        .sort({ timestamp: -1 });
      
      console.log(`Found ${projects.length} projects for user ${user._id}`);
      
      // If no projects exist, create sample data
      if (projects.length === 0) {
        try {
          console.log('No projects found, creating sample data...');
          await seedSampleData(user._id);
          projects = await Project.find({ userId: user._id })
            .sort({ timestamp: -1 });
          console.log(`Created sample data, now have ${projects.length} projects`);
        } catch (seedError) {
          console.error('Error creating sample data:', seedError);
          // Continue with empty projects array
        }
      }
      
      res.json(projects);
    } catch (authError) {
      console.error('Authentication error:', authError);
      return res.json([]);
    }
  } catch (error) {
    console.error('Error in /all endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create sample data endpoint
router.post('/create-sample', authenticateToken, async (req, res) => {
  try {
    const project = await seedSampleData(req.user._id);
    res.json({
      message: 'Sample data created successfully',
      project
    });
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

// Get cache statistics (admin endpoint)
router.get('/cache-stats', authenticateToken, async (req, res) => {
  try {
    const stats = lcaOptimizationService.getCacheStats();
    res.json({
      success: true,
      cacheStats: stats,
      message: 'Cache statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving cache stats:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve cache statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Clear cache (admin endpoint)
router.post('/clear-cache', authenticateToken, async (req, res) => {
  try {
    lcaOptimizationService.clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;