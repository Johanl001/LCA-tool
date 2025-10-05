// Sample project data for testing
import Project from '../models/Project.js';
import mongoose from 'mongoose';

const sampleProjects = [
  {
    projectId: 'sample-aluminum-001',
    projectName: 'Primary Aluminum Production Study',
    overallData: {
      totalEnergyUsage: 20.5,
      totalWaterUsage: 12.5,
      sustainabilityScore: 75,
      projectNotes: 'Comparative LCA study of aluminum production methods',
      metalType: 'Aluminum',
      productionRoute: 'Primary',
      region: 'India',
      productLifetime: 50,
      reusePercentage: 5,
      recyclePercentage: 25,
      landfillPercentage: 70
    },
    stages: [
      {
        stageName: 'Bauxite Mining',
        energyUsage: 1.2,
        waterUsage: 2.5,
        materialType: 'Aluminum',
        transportMode: 'truck',
        transportDistance: 150,
        wasteGenerated: 3.0,
        co2Emissions: 0.8,
        fuelType: 'Mixed',
        recyclingPercentage: 5,
        efficiency: 85
      },
      {
        stageName: 'Alumina Refining',
        energyUsage: 3.5,
        waterUsage: 8.2,
        materialType: 'Aluminum',
        transportMode: 'rail',
        transportDistance: 200,
        wasteGenerated: 1.5,
        co2Emissions: 2.1,
        fuelType: 'Natural Gas',
        recyclingPercentage: 10,
        efficiency: 88
      },
      {
        stageName: 'Aluminum Smelting',
        energyUsage: 15.8,
        waterUsage: 1.8,
        materialType: 'Aluminum',
        transportMode: 'truck',
        transportDistance: 50,
        wasteGenerated: 0.5,
        co2Emissions: 12.0,
        fuelType: 'Mixed',
        recyclingPercentage: 0,
        efficiency: 95
      }
    ],
    sustainabilityScore: 75,
    circularScore: 85,
    linearScore: 45,
    status: 'completed'
  }
];

export async function seedSampleData(userId) {
  try {
    // Check if sample data already exists
    const existingProject = await Project.findOne({ projectId: 'sample-aluminum-001' });
    
    if (!existingProject) {
      const projectData = { ...sampleProjects[0], userId };
      const project = new Project(projectData);
      await project.save();
      console.log('✅ Sample project created successfully');
      return project;
    } else {
      console.log('✅ Sample project already exists');
      return existingProject;
    }
  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
}

export default { seedSampleData };