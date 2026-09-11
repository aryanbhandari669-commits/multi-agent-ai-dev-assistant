import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['coding', 'research', 'review', 'notes', 'general'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  agentsInvolved: [{
    type: String,
    enum: ['orchestrator', 'coding', 'research', 'codeReview', 'notes']
  }],
  result: mongoose.Schema.Types.Mixed,
  error: String,
  estimatedDuration: Number,
  actualDuration: Number,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

TaskSchema.index({ status: 1, createdAt: -1 });
TaskSchema.index({ type: 1, status: 1 });

export default mongoose.model('Task', TaskSchema);
