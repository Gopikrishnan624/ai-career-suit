import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['resume', 'simulator', 'interview'],
    required: true,
  },
  input: mongoose.Schema.Types.Mixed,
  result: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Analysis', analysisSchema);
