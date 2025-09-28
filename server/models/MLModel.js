import mongoose from 'mongoose';

const mlModelSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true,
    unique: true
  },
  path: {
    type: String,
    required: true
  },
  accuracy: {
    type: Number,
    default: 0
  },
  lastTrained: {
    type: Date,
    default: Date.now
  },
  trainingData: {
    samplesCount: { type: Number, default: 0 },
    features: [String]
  }
});

export default mongoose.model('MLModel', mlModelSchema);