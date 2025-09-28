import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema({
  stageName: { type: String, required: true },
  energyUsage: { type: Number, required: true }, // GJ
  waterUsage: { type: Number, required: true }, // m³
  materialType: { type: String, required: true },
  transportMode: { type: String, required: true },
  transportDistance: { type: Number, required: true }, // km
  wasteGenerated: { type: Number, default: 0 }, // kg
  co2Emissions: { type: Number, default: 0 }, // kg CO2
  fuelType: { type: String, default: 'Mixed' },
  recyclingPercentage: { type: Number, default: 0 },
  efficiency: { type: Number, default: 85 }
});

const overallDataSchema = new mongoose.Schema({
  totalEnergyUsage: { type: Number, required: true },
  totalWaterUsage: { type: Number, required: true },
  sustainabilityScore: { type: Number, default: 0 },
  projectNotes: { type: String, default: '' },
  metalType: { type: String, required: true },
  productionRoute: { type: String, enum: ['Primary', 'Secondary'], required: true },
  region: { type: String, required: true },
  productLifetime: { type: Number, default: 10 }, // years
  reusePercentage: { type: Number, default: 0 },
  recyclePercentage: { type: Number, default: 0 },
  landfillPercentage: { type: Number, default: 100 }
});

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  overallData: overallDataSchema,
  stages: [stageSchema],
  sustainabilityScore: {
    type: Number,
    default: 0
  },
  circularScore: {
    type: Number,
    default: 0
  },
  linearScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'completed', 'archived'],
    default: 'draft'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Project', projectSchema);