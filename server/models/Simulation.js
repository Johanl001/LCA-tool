import mongoose from 'mongoose';

const simulationSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true
  },
  scenarioName: {
    type: String,
    required: true
  },
  scenarioChanges: {
    energySource: { type: String },
    materialType: { type: String },
    transportMode: { type: String },
    recyclingRate: { type: Number },
    efficiency: { type: Number }
  },
  predictedScores: {
    sustainabilityScore: { type: Number, default: 0 },
    energyReduction: { type: Number, default: 0 },
    waterReduction: { type: Number, default: 0 },
    co2Reduction: { type: Number, default: 0 }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Simulation', simulationSchema);