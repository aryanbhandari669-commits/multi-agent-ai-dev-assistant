import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [
    {
      id: String,
      role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
      },
      content: String,
      agentType: {
        type: String,
        enum: ['orchestrator', 'coding', 'research', 'codeReview', 'notes']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      metadata: mongoose.Schema.Types.Mixed
    }
  ],
  context: {
    tags: [String],
    codeBlocks: [
      {
        language: String,
        code: String
      }
    ],
    references: [String]
  },
  agentHistory: [
    {
      agent: String,
      task: String,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed']
      },
      result: mongoose.Schema.Types.Mixed,
      timestamp: Date
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ConversationSchema.index({ createdAt: -1 });
ConversationSchema.index({ 'messages.timestamp': -1 });

export default mongoose.model('Conversation', ConversationSchema);
